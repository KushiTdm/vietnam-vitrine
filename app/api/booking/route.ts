/**
 * Prise de rendez-vous de Hanoi — `GET` les créneaux, `POST` la demande.
 *
 * Distinct de celui de neuraweb.fr, et il doit le rester : ce ne sont ni les
 * mêmes horaires, ni le même fuseau, ni le même canal de rappel. Tout passe
 * par la colonne `site = 'vn'` de `bookings` et `booking_slots` (migration
 * `site_partition_france_vietnam`), si bien qu'un créneau de 10:00 à Hanoi
 * n'occupe jamais le 10:00 de Paris.
 *
 * Le fuseau est traité explicitement partout : le serveur Vercel tourne en
 * UTC, le visiteur est à Hanoi (UTC+7). Sans ça, « aujourd'hui » bascule au
 * mauvais moment et on propose des créneaux déjà passés toute la soirée.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/lib/registry";
import { getClientIp, rateLimit } from "@/lib/chat/guard";
import { insertReturning, select } from "@/lib/supabase/rest";

export const dynamic = "force-dynamic";

// ────────────────────────────────────────────────────────────
// Le gabarit de la semaine, côté Hanoi
// ────────────────────────────────────────────────────────────

const TIMEZONE = "Asia/Ho_Chi_Minh";
/**
 * Lundi à samedi — le samedi est un jour ouvré normal pour un café ou un
 * salon, et c'est souvent le seul où le gérant a le temps de s'asseoir.
 * Dimanche fermé. 0 = dimanche, 6 = samedi.
 */
const OPEN_WEEKDAYS = [1, 2, 3, 4, 5, 6];
/**
 * Avant 11 h et après 14 h : on évite le coup de feu du déjeuner, qui est
 * précisément le moment où un commerçant ne peut pas parler.
 */
const TEMPLATE_TIMES = ["09:00", "10:30", "14:00", "16:00", "18:00"];
/** Horizon proposé au visiteur. */
const DAYS_AHEAD = 14;
/** Délai minimal avant un créneau : on ne propose pas un rendez-vous dans l'heure. */
const MIN_NOTICE_MINUTES = 120;

const LOCALES: Locale[] = ["vi", "en", "fr"];
const NAME_MAX = 80;
const MESSAGE_MAX = 500;

// ────────────────────────────────────────────────────────────
// Dates, à l'heure de Hanoi
// ────────────────────────────────────────────────────────────

/** « 2026-09-24 » dans le fuseau de Hanoi, quelle que soit l'heure du serveur. */
function hanoiDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Minutes écoulées depuis minuit à Hanoi. */
function hanoiMinutesOfDay(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  const [h, m] = parts.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Jour de la semaine à Hanoi, 0 = dimanche. */
function hanoiWeekday(dateKey: string): number {
  // Midi UTC : aucun décalage de fuseau ne peut faire changer le jour.
  return new Date(`${dateKey}T12:00:00Z`).getUTCDay();
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Étiquette lisible du jour, dans la langue du visiteur. */
function dayLabel(dateKey: string, locale: Locale): string {
  const tag = locale === "vi" ? "vi-VN" : locale === "en" ? "en-GB" : "fr-FR";
  return new Intl.DateTimeFormat(tag, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

// ────────────────────────────────────────────────────────────
// GET — les créneaux libres
// ────────────────────────────────────────────────────────────

type SlotRow = { date: string; time: string; is_open: boolean };
type BookingRow = { date: string; time: string };

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale: Locale = LOCALES.includes(localeParam as Locale) ? (localeParam as Locale) : "vi";

  const now = new Date();
  const today = hanoiDateKey(now);
  const horizon = hanoiDateKey(new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000));

  // Exceptions saisies depuis l'app mobile, et créneaux déjà pris.
  const [exceptions, taken] = await Promise.all([
    select<SlotRow>("booking_slots", `select=date,time,is_open&date=gte.${today}&date=lte.${horizon}`),
    select<BookingRow>("bookings", `select=date,time&status=neq.cancelled&date=gte.${today}&date=lte.${horizon}`),
  ]);

  const closed = new Set(
    exceptions.filter((e) => !e.is_open).map((e) => `${e.date} ${e.time}`),
  );
  const added = exceptions.filter((e) => e.is_open);
  const busy = new Set(taken.map((b) => `${b.date} ${b.time}`));

  const nowMinutes = hanoiMinutesOfDay(now);
  const days: { date: string; label: string; times: string[] }[] = [];

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const dateKey = hanoiDateKey(new Date(now.getTime() + i * 24 * 60 * 60 * 1000));
    const template = OPEN_WEEKDAYS.includes(hanoiWeekday(dateKey)) ? TEMPLATE_TIMES : [];
    const extra = added.filter((e) => e.date === dateKey).map((e) => e.time);

    const times = Array.from(new Set([...template, ...extra]))
      .filter((time) => !closed.has(`${dateKey} ${time}`))
      .filter((time) => !busy.has(`${dateKey} ${time}`))
      // Le jour même, on n'offre que ce qui laisse le temps d'arriver.
      .filter((time) => dateKey !== today || minutesOf(time) >= nowMinutes + MIN_NOTICE_MINUTES)
      .sort();

    if (times.length) days.push({ date: dateKey, label: dayLabel(dateKey, locale), times });
  }

  return NextResponse.json({ timezone: TIMEZONE, days });
}

// ────────────────────────────────────────────────────────────
// POST — la demande de rendez-vous
// ────────────────────────────────────────────────────────────

type Payload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  date?: unknown;
  time?: unknown;
  locale?: unknown;
  /** Champ leurre, invisible : rempli ⇒ robot. */
  website?: unknown;
};

const MESSAGES: Record<Locale, Record<string, string>> = {
  vi: {
    invalid: "Anh/chị điền giúp mình tên và số điện thoại (hoặc Zalo) nhé.",
    slotGone: "Rất tiếc, khung giờ này vừa có người đặt. Anh/chị chọn giờ khác giúp mình nhé.",
    error: "Chưa gửi được yêu cầu. Anh/chị thử lại, hoặc nhắn Zalo trực tiếp nhé.",
    ok: "Đã ghi nhận! Mình sẽ nhắn Zalo xác nhận với anh/chị trong hôm nay.",
  },
  en: {
    invalid: "Please leave your name and a phone or Zalo number.",
    slotGone: "That slot has just been taken. Could you pick another one?",
    error: "The request could not be sent. Try again, or message us on Zalo.",
    ok: "Noted! We'll confirm on Zalo today.",
  },
  fr: {
    invalid: "Merci d'indiquer votre nom et un téléphone ou Zalo.",
    slotGone: "Ce créneau vient d'être pris. Pouvez-vous en choisir un autre ?",
    error: "La demande n'a pas pu être envoyée. Réessayez, ou écrivez-nous sur Zalo.",
    ok: "C'est noté ! Nous confirmons sur Zalo dans la journée.",
  },
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export async function POST(request: NextRequest) {
  let locale: Locale = "vi";

  try {
    // Même politique que le chat : ce point d'entrée sert la vitrine.
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== request.headers.get("host")) {
          return NextResponse.json({ error: MESSAGES.vi.error }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: MESSAGES.vi.error }, { status: 403 });
      }
    }

    const body: Payload = await request.json();
    locale = LOCALES.includes(body.locale as Locale) ? (body.locale as Locale) : "vi";
    const m = MESSAGES[locale];

    // Leurre : on renvoie un succès de façade, le robot n'apprend rien.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true, message: m.ok });
    }

    const ip = getClientIp(request.headers);
    // Trois demandes par heure et par IP : un commerçant n'en prend pas dix.
    const limit = rateLimit(`booking:${ip}`, 3, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: m.error, retryAfter: limit.retryAfter ?? 600 },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter ?? 600) } },
      );
    }

    const name = typeof body.name === "string" ? body.name.trim().slice(0, NAME_MAX) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 120) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, MESSAGE_MAX) : "";
    const date = typeof body.date === "string" ? body.date : "";
    const time = typeof body.time === "string" ? body.time : "";

    if (
      name.length < 2 ||
      (!phone && !email) ||
      !DATE_PATTERN.test(date) ||
      !TIME_PATTERN.test(time)
    ) {
      return NextResponse.json({ error: m.invalid }, { status: 400 });
    }

    // Jamais dans le passé, jamais au-delà de l'horizon annoncé.
    const today = hanoiDateKey(new Date());
    const horizon = hanoiDateKey(new Date(Date.now() + DAYS_AHEAD * 24 * 60 * 60 * 1000));
    if (date < today || date > horizon) {
      return NextResponse.json({ error: m.slotGone }, { status: 409 });
    }

    const { data, code } = await insertReturning<{ id: string }>("bookings", {
      name,
      email: email || null,
      phone: phone || null,
      service: "website",
      date,
      time,
      message: message || null,
      language: locale,
      status: "pending",
      source: "website",
    });

    // 23505 = violation d'unicité : l'index `bookings_site_date_time_active_uidx`
    // vient d'empêcher une double réservation sur le même créneau.
    if (code === "23505") {
      return NextResponse.json({ error: m.slotGone }, { status: 409 });
    }
    if (!data) {
      return NextResponse.json({ error: m.error }, { status: 502 });
    }

    return NextResponse.json({ ok: true, message: m.ok });
  } catch (error) {
    console.error("[booking] erreur :", error);
    return NextResponse.json({ error: MESSAGES[locale].error }, { status: 500 });
  }
}
