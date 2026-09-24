"use client";

/**
 * Widget de chat de la vitrine — la partie visible de `app/api/chat`.
 *
 * Il ne détient aucune règle métier : la langue vient de `LanguageProvider`
 * (donc de l'URL), les textes de `lib/ui.ts`, et tout ce qui touche à l'offre
 * ou à la sécurité est décidé côté serveur. Ici on gère l'ouverture, le fil de
 * messages, et le quota renvoyé par l'API.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

type Message = { role: "user" | "assistant"; content: string };

type ChatResponse = {
  response?: string;
  error?: string;
  remainingMessages?: number;
  maxMessages?: number;
  /** Secondes à attendre avant de pouvoir renvoyer (débit dépassé, modèle saturé). */
  retryAfter?: number;
  /** Le serveur a reconnu une demande de rendez-vous. */
  showBookingDates?: boolean;
};

/** Un jour proposé par `GET /api/booking`, avec ses heures encore libres. */
type BookingDay = { date: string; label: string; times: string[] };

/**
 * Le parcours de prise de rendez-vous, dans le fil de la conversation :
 * jour → heure → coordonnées. Trois écrans courts plutôt qu'un formulaire,
 * parce que tout se remplit au pouce sur un téléphone.
 */
type BookingStep = "none" | "days" | "times" | "form" | "sent";

const SESSION_KEY = "neuraweb_vn_chat_session";
const TEASER_DELAY_MS = 8_000;
const MAX_INPUT = 500;

/** Chemins internes rendus cliquables dans une réponse — liste fermée exprès. */
const RICH_TOKEN = /(\*\*[^*]+\*\*)|((?:\/(?:en|fr))?\/(?:packs|qua-tang|metiers)[\w/-]*)/g;
/**
 * Le prompt interdit les liens markdown, mais un modèle finit toujours par en
 * écrire un. On garde le chemin s'il est interne (il sera rendu cliquable
 * ci-dessous), et seulement le libellé sinon : une adresse inventée ne doit
 * jamais devenir un lien cliquable dans la page.
 */
const MD_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function BotIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="3" y="6" width="18" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="12.5" r="1.3" fill="currentColor" />
      <circle cx="15" cy="12.5" r="1.3" fill="currentColor" />
      <path d="M9.5 16.5c.9 .9 4.1 .9 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 6V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="2.8" r="1" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M3 10l14-6-6 14-2.2-5.8L3 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** `**gras**`, retours à la ligne et liens internes — jamais de HTML brut. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block">
          {line
            .replace(MD_LINK, (_, label: string, href: string) => (href.startsWith("/") ? href : label))
            .split(RICH_TOKEN)
            .map((part, j) => {
              if (!part) return null;
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith("/")) {
                return (
                  <a key={j} href={part} className="underline underline-offset-2">
                    {part}
                  </a>
                );
              }
              return <span key={j}>{part}</span>;
            })}
        </span>
      ))}
    </>
  );
}

export default function Chatbot() {
  const { t, locale } = useLanguage();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [teaser, setTeaser] = useState(false);

  /**
   * Blocage de l'envoi. `blockedUntil` est un instant, `countdown` le nombre
   * de secondes affiché — dérivé par un intervalle, pour que le compteur
   * descende même si rien d'autre ne bouge à l'écran.
   */
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const [bookingStep, setBookingStep] = useState<BookingStep>("none");
  const [bookingDays, setBookingDays] = useState<BookingDay[]>([]);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", note: "" });
  const [bookingSending, setBookingSending] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef("");

  /**
   * Un identifiant de session par navigateur : il porte le quota de messages,
   * pas une identité. Créé au premier envoi et non au montage — `localStorage`
   * n'existe pas au rendu serveur, et rien à l'écran n'en dépend. Le serveur
   * impose son format et compte de toute façon par IP.
   */
  const getSessionId = useCallback(() => {
    if (sessionRef.current) return sessionRef.current;
    const fresh = `session_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored) {
        sessionRef.current = stored;
        return stored;
      }
      window.localStorage.setItem(SESSION_KEY, fresh);
    } catch {
      // Navigation privée ou stockage refusé : la session ne survit pas au
      // rechargement, ce n'est pas bloquant.
    }
    sessionRef.current = fresh;
    return fresh;
  }, []);

  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => setTeaser(true), TEASER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Décompte du blocage. Le `setState` vit dans le rappel de l'intervalle,
  // pas dans le corps de l'effet : il ne déclenche pas de rendu en cascade.
  useEffect(() => {
    if (!blockedUntil) return;
    const tick = () => {
      const left = Math.ceil((blockedUntil - Date.now()) / 1000);
      setCountdown(left > 0 ? left : 0);
      if (left <= 0) setBlockedUntil(0);
    };
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [blockedUntil]);

  /** Charge les créneaux libres et ouvre le choix du jour. */
  const loadBookingDays = useCallback(async () => {
    setBookingStep("days");
    try {
      const res = await fetch(`/api/booking?locale=${locale}`);
      const data: { days?: BookingDay[] } = await res.json();
      setBookingDays(data.days ?? []);
    } catch {
      setBookingDays([]);
    }
  }, [locale]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_INPUT);
      // Un envoi bloqué ne part pas : c'est tout l'intérêt du décompte.
      if (!text || loading || Date.now() < blockedUntil) return;

      setError(null);
      setInput("");
      setLoading(true);

      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const sessionId = getSessionId();
      setMessages((prev) => [...prev, { role: "user", content: text }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sessionId,
            locale,
            history,
            website: honeypotRef.current?.value ?? "",
          }),
        });
        const data: ChatResponse = await res.json();

        if (typeof data.remainingMessages === "number") setRemaining(data.remainingMessages);

        // Débit dépassé ou modèle saturé : le serveur dit combien de temps
        // attendre, le champ se verrouille jusque-là.
        if (typeof data.retryAfter === "number" && data.retryAfter > 0) {
          setBlockedUntil(Date.now() + data.retryAfter * 1000);
          setCountdown(data.retryAfter);
        }

        if (data.response) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.response! }]);
          if (data.showBookingDates) void loadBookingDays();
        } else {
          setError(data.error ?? t("chatDisclaimer"));
        }
      } catch {
        setError(t("chatDisclaimer"));
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [blockedUntil, getSessionId, loadBookingDays, loading, locale, messages, t],
  );

  const submitBooking = useCallback(async () => {
    if (bookingSending || !bookingForm.name.trim() || !bookingForm.phone.trim()) return;
    setBookingSending(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          message: bookingForm.note,
          date: bookingDate,
          time: bookingTime,
          locale,
          website: honeypotRef.current?.value ?? "",
        }),
      });
      const data: { ok?: boolean; message?: string; error?: string } = await res.json();
      if (data.ok && data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message! }]);
        setBookingStep("sent");
      } else {
        // Créneau pris entre-temps : on renvoie au choix du jour, rafraîchi.
        setError(data.error ?? t("chatDisclaimer"));
        if (res.status === 409) void loadBookingDays();
      }
    } catch {
      setError(t("chatDisclaimer"));
    } finally {
      setBookingSending(false);
    }
  }, [bookingDate, bookingForm, bookingSending, bookingTime, loadBookingDays, locale, t]);

  /** Envoi verrouillé : débit dépassé côté session, ou modèle saturé. */
  const blocked = countdown > 0;

  const suggestions = [t("chatSuggest1"), t("chatSuggest2"), t("chatSuggest3")];
  const showSuggestions = messages.length === 0 && !loading;

  // L'accueil est calculé au rendu, jamais stocké : il suit la langue de l'URL
  // tant que la conversation n'a pas commencé, et n'est pas renvoyé à l'API.
  const thread: Message[] = messages.length
    ? messages
    : [{ role: "assistant", content: t("chatGreeting") }];

  return (
    <>
      {/* ---------- Bouton flottant ---------- */}
      {!open && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 sm:bottom-6 sm:right-6">
          {teaser && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="hidden max-w-[15rem] rounded-full border border-line bg-ground px-4 py-2 text-left text-[14px] text-ink shadow-lg transition-opacity hover:opacity-90 sm:block"
            >
              {t("chatTeaser")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("chatOpen")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-deep shadow-xl transition-transform hover:scale-105 focus-visible:scale-105"
          >
            <BotIcon className="h-7 w-7" />
          </button>
        </div>
      )}

      {/* ---------- Panneau ---------- */}
      {open && (
        <section
          role="dialog"
          aria-label={t("chatTitle")}
          className="fixed inset-x-3 bottom-3 top-3 z-50 flex flex-col overflow-hidden rounded-2xl border border-line bg-ground shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[min(34rem,calc(100dvh-6rem))] sm:w-[23rem]"
        >
          <header className="flex items-center gap-3 border-b border-line bg-deep px-4 py-3 text-on-deep">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-deep">
              <BotIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[16px] leading-tight">{t("chatTitle")}</span>
              <span className="block truncate text-[13px] text-[rgba(243,237,227,0.66)]">
                {t("chatSubtitle")}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("chatClose")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[rgba(243,237,227,0.7)] transition-colors hover:bg-[rgba(243,237,227,0.12)] hover:text-on-deep"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {thread.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-3.5 py-2.5 text-[15px] leading-snug text-ground"
                    : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-line bg-white px-3.5 py-2.5 text-[15px] leading-snug text-ink"
                }
              >
                <RichText text={m.content} />
              </div>
            ))}

            {loading && (
              <p className="mr-auto rounded-2xl rounded-bl-sm border border-line bg-white px-3.5 py-2.5 text-[14px] text-muted">
                {t("chatTyping")}
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-[rgba(142,42,32,0.25)] bg-[rgba(142,42,32,0.06)] px-3.5 py-2.5 text-[14px] text-[#8E2A20]">
                {error}
              </p>
            )}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-[13px] text-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* ── Prise de rendez-vous : un écran à la fois ─────────────── */}
            {bookingStep === "days" && (
              <div className="rounded-2xl border border-line bg-white p-3">
                <p className="mb-2 text-[13px] font-medium text-ink">
                  {t("chatBookPickDay")} <span className="text-muted">· {t("chatBookTz")}</span>
                </p>
                {bookingDays.length === 0 ? (
                  <p className="text-[14px] text-muted">{t("chatBookNone")}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {bookingDays.map((day) => (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => {
                          setBookingDate(day.date);
                          setBookingStep("times");
                        }}
                        className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-ink"
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {bookingStep === "times" && (
              <div className="rounded-2xl border border-line bg-white p-3">
                <p className="mb-2 text-[13px] font-medium text-ink">{t("chatBookPickTime")}</p>
                <div className="flex flex-wrap gap-2">
                  {(bookingDays.find((d) => d.date === bookingDate)?.times ?? []).map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setBookingTime(time);
                        setBookingStep("form");
                      }}
                      className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-ink"
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setBookingStep("days")}
                  className="mt-2 text-[13px] text-muted underline underline-offset-2"
                >
                  {t("chatBookBack")}
                </button>
              </div>
            )}

            {bookingStep === "form" && (
              <div className="space-y-2 rounded-2xl border border-line bg-white p-3">
                <p className="text-[13px] font-medium text-ink">
                  {bookingDays.find((d) => d.date === bookingDate)?.label} · {bookingTime}
                </p>
                <input
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t("chatBookName")}
                  aria-label={t("chatBookName")}
                  className="min-h-11 w-full rounded-xl border border-line px-3 text-[16px] outline-none focus:border-ink"
                />
                <input
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder={t("chatBookPhone")}
                  aria-label={t("chatBookPhone")}
                  inputMode="tel"
                  className="min-h-11 w-full rounded-xl border border-line px-3 text-[16px] outline-none focus:border-ink"
                />
                <input
                  value={bookingForm.note}
                  onChange={(e) => setBookingForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder={t("chatBookNote")}
                  aria-label={t("chatBookNote")}
                  className="min-h-11 w-full rounded-xl border border-line px-3 text-[16px] outline-none focus:border-ink"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void submitBooking()}
                    disabled={bookingSending || !bookingForm.name.trim() || !bookingForm.phone.trim()}
                    className="min-h-11 flex-1 rounded-full bg-gold px-4 text-[15px] font-medium text-deep transition-opacity disabled:opacity-40"
                  >
                    {bookingSending ? t("chatBookSending") : t("chatBookSubmit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStep("times")}
                    className="text-[13px] text-muted underline underline-offset-2"
                  >
                    {t("chatBookBack")}
                  </button>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-line px-3 pb-3 pt-3"
          >
            {/* Leurre : masqué aux humains et aux lecteurs d'écran, rempli par les bots. */}
            <input
              ref={honeypotRef}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_INPUT}
                autoComplete="off"
                disabled={blocked}
                placeholder={blocked ? t("chatWait").replace("{n}", String(countdown)) : t("chatPlaceholder")}
                aria-label={t("chatPlaceholder")}
                className="min-h-11 flex-1 rounded-full border border-line bg-white px-4 text-[16px] text-ink outline-none placeholder:text-muted focus:border-ink disabled:bg-[rgba(22,20,15,0.04)] disabled:text-muted"
              />
              <button
                type="submit"
                disabled={loading || blocked || !input.trim()}
                aria-label={t("chatSend")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-deep transition-opacity disabled:opacity-40"
              >
                <SendIcon />
              </button>
            </div>

            <p className="mt-2 px-1 text-[12px] leading-snug text-muted">
              {blocked
                ? t("chatWait").replace("{n}", String(countdown))
                : remaining !== null && remaining <= 5
                ? t("chatRemaining").replace("{n}", String(remaining))
                : t("chatDisclaimer")}
            </p>
          </form>
        </section>
      )}
    </>
  );
}
