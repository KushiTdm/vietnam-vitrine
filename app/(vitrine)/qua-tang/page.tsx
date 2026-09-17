"use client";

import Image from "next/image";
import { OPTIONS, formatVnd, getPack, type L10n, type Pack } from "@hanoi/registry";
import { agency } from "../showcase.config";
import { useLanguage } from "../components/LanguageProvider";

// Les deux paliers que la page renvoie systématiquement à l'upsell : la page offerte
// est amputée d'exactement ce que Khởi Đầu et Phát Triển ajoutent (§3 de
// `OFFRE-JEU-FACEBOOK.md`) — jamais des chaînes recopiées à la main, pour que la page
// reste juste si la grille bouge dans `packages/registry/src/packs.ts`.
const KHOI_DAU = getPack("khoi-dau")!;
const PHAT_TRIEN = getPack("phat-trien")!;
const ESPACE_GESTION_PRICE = OPTIONS.find((o) => o.id === "espace-gestion")!.priceByPack!["khoi-dau"]!;

const GIFTS: { title: L10n; body: L10n }[] = [
  {
    title: { vi: "Thiết kế riêng", en: "Custom design", fr: "Design sur mesure" },
    body: {
      vi: "Một trang web làm riêng cho quán của anh/chị, không phải mẫu dùng chung.",
      en: "A page designed for your business, not a recycled template.",
      fr: "Une page dessinée pour votre établissement, pas un gabarit recyclé.",
    },
  },
  {
    title: { vi: "Nhanh trên điện thoại", en: "Fast on mobile", fr: "Rapide sur mobile" },
    body: {
      vi: "Ảnh quán, giờ mở cửa, bản đồ chỉ đường — mở trong chớp mắt.",
      en: "Photos, opening hours, map and directions — opens instantly.",
      fr: "Photos, horaires, carte et itinéraire — ouverture immédiate.",
    },
  },
  {
    title: { vi: "Khách gọi được ngay", en: "Contact in one tap", fr: "Contact en un geste" },
    body: {
      vi: "Nút Gọi – Zalo – Messenger luôn hiện trên màn hình, không cần cuộn.",
      en: "Call – Zalo – Messenger buttons always visible, no scrolling.",
      fr: "Boutons Appel – Zalo – Messenger toujours visibles, sans scroller.",
    },
  },
  {
    title: { vi: "Mã QR tại quầy", en: "QR at the counter", fr: "QR au comptoir" },
    body: {
      vi: "File khổ A5 in ra dán ở quầy, khách quét là vào thẳng trang.",
      en: "An A5 file ready to print at the counter — scanned, it opens the page.",
      fr: "Une affiche A5 prête à imprimer, scannée elle ouvre la page.",
    },
  },
  {
    title: { vi: "Bàn giao 7 ngày", en: "Delivered in 7 days", fr: "Livraison en 7 jours" },
    body: {
      vi: "Kể từ khi anh/chị gửi đủ nội dung. Kèm hướng dẫn sử dụng 15 phút.",
      en: "From the moment your content is in. A 15-minute walkthrough is included.",
      fr: "À compter de la réception du contenu. Prise en main de 15 minutes comprise.",
    },
  },
  {
    title: { vi: "Của anh/chị", en: "You own it", fr: "Vous en êtes propriétaire" },
    body: {
      vi: "Trang web và nội dung thuộc về cơ sở. Mã nguồn bàn giao nếu anh/chị yêu cầu.",
      en: "The page and its content are yours. The source code is handed over on request.",
      fr: "La page et son contenu vous appartiennent. Le code est remis sur demande.",
    },
  },
];

// Prérequis pour être étudié, distinct des critères pondérés ci-dessous : c'est un
// couperet binaire (on l'a ou pas), pas un degré. Le mélanger dans la même liste à
// barres que les critères pondérés — avec juste le mot « éliminatoire » posé à côté —
// laissait croire l'inverse (« avoir une adresse élimine ») plutôt que l'évident
// (« ne pas en avoir élimine »). D'où un bloc séparé, avec la conséquence écrite en
// toutes lettres dans `giftCriteriaGateNote`, jamais laissée à l'inférence d'un mot seul.
const GATE: { label: L10n } = {
  label: {
    vi: "Cơ sở có địa điểm thật, đang mở cửa tại Hà Nội",
    en: "Physical business, open, in Hà Nội",
    fr: "Établissement physique, ouvert, à Hanoï",
  },
};

const CRITERIA: { label: L10n; weight: number }[] = [
  {
    label: {
      vi: "Nhu cầu thật, rõ ràng — chưa có web, hoặc chỉ có Facebook",
      en: "Real need — no site yet, or a Facebook page only",
      fr: "Besoin réel — pas de site, ou page Facebook seule",
    },
    weight: 35,
  },
  {
    label: {
      vi: "Quán lên hình đẹp — trang web còn là công trình mẫu",
      en: "Photogenic place — the page also serves as a showcase",
      fr: "Lieu photogénique — la page sert aussi de vitrine",
    },
    weight: 25,
  },
  {
    label: {
      vi: "Đúng nhóm ngành: quán, tiệm tóc, spa, cửa hàng, homestay",
      en: "In scope: café, salon, spa, shop, homestay",
      fr: "Dans la cible : café, salon, spa, boutique, homestay",
    },
    weight: 20,
  },
  {
    label: {
      vi: "Chủ quán gửi được nội dung trong 48 giờ",
      en: "Content provided by the owner within 48 hours",
      fr: "Contenu fourni par le gérant sous 48 h",
    },
    weight: 20,
  },
];

// Lancement décalé au 21/09/2026 — un lundi, pas un mardi comme la précédente grille
// (15/09). Le rythme hebdomadaire glisse donc lui aussi : post le lundi, annonce le
// dimanche suivant (6 jours après, cycle de 7 jours lundi à lundi) — l'annonce du
// dimanche 20h ne change pas, seul le jour du post d'appel bouge.
// Le 10/10 (samedi) tombe dans le cycle de la semaine 3 et le 20/10 (mardi) dans celui
// de la semaine 5 : les deux semaines à drapeau ont donc glissé par rapport à l'ancienne
// grille (elles étaient en semaines 4 et 6), les thèmes non datés se replacent autour.
const WEEKS: { n: number; date: string; theme: L10n; flag?: boolean }[] = [
  { n: 1, date: "21/09", theme: { vi: "Ra mắt", en: "Launch", fr: "Lancement" } },
  {
    n: 2,
    date: "28/09",
    theme: { vi: "Trước / Sau đầu tiên", en: "First before/after", fr: "Premier avant/après" },
  },
  {
    n: 3,
    date: "05/10",
    theme: { vi: "Hà Nội · 10/10", en: "Hà Nội · Oct 10", fr: "Hanoï · 10/10" },
    flag: true,
  },
  {
    n: 4,
    date: "12/10",
    theme: { vi: "Quán cà phê & quán ăn", en: "Cafés & restaurants", fr: "Cafés et restaurants" },
  },
  {
    n: 5,
    date: "19/10",
    theme: {
      vi: "Phụ nữ Việt Nam · tiệm tóc, spa",
      en: "Vietnamese Women's Day · salons, spas",
      fr: "Femmes vietnamiennes · salons, spas",
    },
    flag: true,
  },
  { n: 6, date: "26/10", theme: { vi: "Cửa hàng", en: "Shops", fr: "Boutiques" } },
  { n: 7, date: "02/11", theme: { vi: "Homestay", en: "Homestays", fr: "Homestays" } },
  { n: 8, date: "09/11", theme: { vi: "Tuần cuối cùng", en: "Final week", fr: "Dernière semaine" } },
];

const SERVICE_FEE_ITEMS: L10n[] = [
  { vi: "Cài tên miền & DNS", en: "Domain & DNS setup", fr: "Configuration du domaine & DNS" },
  { vi: "Chứng chỉ bảo mật HTTPS", en: "HTTPS certificate", fr: "Certificat HTTPS" },
  { vi: "Đưa web lên mạng · 12 tháng", en: "Hosting · 12 months", fr: "Mise en ligne · 12 mois" },
  { vi: "Email theo tên miền", en: "Domain email", fr: "E-mail au nom du domaine" },
  { vi: "Lập hồ sơ Google Maps", en: "Google Maps listing", fr: "Fiche Google Maps" },
  { vi: "File mã QR khổ A5", en: "A5 QR poster file", fr: "Affiche QR A5" },
  { vi: "Hướng dẫn sử dụng · 15 phút", en: "Walkthrough · 15 min", fr: "Prise en main · 15 min" },
];

type Exclusion = { what: L10n; where: { pack: Pack } | { text: string } };

const EXCLUSIONS: Exclusion[] = [
  {
    what: { vi: "Thực đơn / bảng giá", en: "Menu or price list", fr: "Carte ou menu avec les prix" },
    where: { pack: KHOI_DAU },
  },
  {
    what: { vi: "Bản tiếng Anh", en: "English version", fr: "Version anglaise" },
    where: { pack: KHOI_DAU },
  },
  {
    what: {
      vi: "Tối ưu Google & hồ sơ Google Business",
      en: "Local SEO & Google Business profile",
      fr: "SEO et fiche Google Business",
    },
    where: { pack: KHOI_DAU },
  },
  {
    what: {
      vi: "Biểu mẫu liên hệ, đặt lịch",
      en: "Contact form, bookings",
      fr: "Formulaire, prise de rendez-vous",
    },
    where: { pack: PHAT_TRIEN },
  },
  {
    what: { vi: "Tự sửa nội dung", en: "Self-service editing", fr: "Espace de gestion" },
    where: { text: `+${formatVnd(ESPACE_GESTION_PRICE)}` },
  },
  {
    what: {
      vi: "Sửa đổi sau khi bàn giao",
      en: "Changes after delivery",
      fr: "Modifications après livraison",
    },
    where: { text: "500.000₫/h" },
  },
  {
    what: { vi: "Trang thứ hai", en: "A second page", fr: "Une deuxième page" },
    where: { pack: PHAT_TRIEN },
  },
];

const RULES: { title: L10n; body: L10n }[] = [
  {
    title: { vi: "Đơn vị tổ chức", en: "Organiser", fr: "Organisateur" },
    body: { vi: "Neuraweb.", en: "Neuraweb.", fr: "Neuraweb." },
  },
  {
    title: { vi: "Không liên kết với Facebook", en: "Not affiliated with Facebook", fr: "Non-affiliation" },
    body: {
      vi: "Chương trình do Neuraweb tổ chức, không được Facebook/Meta tài trợ, quản lý hay bảo trợ. Thông tin anh/chị cung cấp là gửi cho Neuraweb, không gửi cho Facebook.",
      en: "Run by Neuraweb, not sponsored, endorsed or administered by Facebook/Meta. Information you provide goes to Neuraweb, never to Facebook.",
      fr: "Opération organisée par Neuraweb, ni parrainée, ni administrée par Meta/Facebook, ni associée à eux. Les informations sont communiquées à Neuraweb, jamais à Facebook.",
    },
  },
  {
    title: { vi: "Thời gian", en: "Duration", fr: "Durée" },
    body: {
      vi: "8 tuần đầu tiên, từ 21/09/2026 đến hết 15/11/2026, mỗi tuần chọn 1 cơ sở. Nếu chương trình vẫn hiệu quả, Neuraweb có thể kéo dài thêm — thông báo trước trên trang.",
      en: "The first 8 weeks run from 21 Sep 2026 through 15 Nov 2026, one business chosen per week. If it's working, Neuraweb may extend the offer — announced in advance on the page.",
      fr: "Les 8 premières semaines courent du 21/09/2026 au 15/11/2026 inclus, un établissement choisi par semaine. Si l'opération fonctionne, Neuraweb pourra la prolonger — annoncé à l'avance sur la page.",
    },
  },
  {
    title: { vi: "Ai được tham gia", en: "Who can enter", fr: "Qui peut participer" },
    body: {
      vi: "Ai cũng có thể tham gia: chủ quán tự giới thiệu, hoặc bất kỳ ai đề xuất một quán/tiệm mình yêu thích. Cơ sở được đề xuất phải có địa điểm thật, đang hoạt động tại Hà Nội. Mỗi cơ sở chỉ tính 1 lần mỗi tuần dù được nhiều người đề xuất. Khi được chọn, phần thưởng chỉ trao cho chủ cơ sở hoặc người được chủ cơ sở uỷ quyền.",
      en: "Anyone can enter: an owner speaking for their own business, or anyone nominating a business they love. The nominated business must be a real, active place in Hà Nội. Each business counts once per week even if nominated by several people. If chosen, the prize is only handed to the owner or someone the owner authorises.",
      fr: "Tout le monde peut participer : un commerçant qui présente son propre établissement, ou n'importe qui proposant un établissement qu'il apprécie. L'établissement proposé doit être un lieu réel, actif, à Hanoï. Chaque établissement ne compte qu'une fois par semaine, même proposé par plusieurs personnes. S'il est choisi, le lot n'est remis qu'au gérant de l'établissement ou à une personne qu'il autorise.",
    },
  },
  {
    title: { vi: "Cách tham gia", en: "How to enter", fr: "Comment participer" },
    body: {
      vi: "Theo dõi trang Neuraweb và bình luận theo mẫu đã nêu — quán của chính anh/chị, hoặc một quán anh/chị muốn đề xuất. Không yêu cầu chia sẻ, không yêu cầu tag; chia sẻ hay tag không làm tăng cơ hội.",
      en: "Follow the Neuraweb page and comment in the format shown above — your own business, or one you'd like to nominate. No share or tag is required; sharing or tagging does not improve your odds.",
      fr: "Suivre la page Neuraweb et commenter au format indiqué — votre propre établissement, ou un autre que vous souhaitez proposer. Aucun partage ni tag demandé ; partager ou taguer n'augmente pas les chances.",
    },
  },
  {
    title: { vi: "Cách chọn", en: "Selection", fr: "Sélection" },
    body: {
      vi: "Không bốc thăm may rủi. Neuraweb xét chọn theo tiêu chí công bố ở trên, công khai kết quả tối Chủ Nhật 20h. Quyết định là cuối cùng và không giải thích riêng từng trường hợp.",
      en: "No raffle. Neuraweb selects on the criteria published above and announces the result publicly every Sunday at 8pm. The decision is final and is not individually explained.",
      fr: "Pas de tirage au sort. Neuraweb choisit selon les critères publiés ci-dessus et annonce publiquement le dimanche à 20h. La décision est définitive et n'a pas à être motivée individuellement.",
    },
  },
  {
    title: { vi: "Hoãn tuần", en: "Postponement", fr: "Report" },
    body: {
      vi: "Dưới 15 bình luận hợp lệ, việc chọn có thể dời sang tuần sau; thông báo hoãn đăng đúng giờ đã hẹn.",
      en: "Below 15 valid comments, the selection may be postponed to the following week; the postponement is announced at the scheduled time.",
      fr: "En dessous de 15 commentaires conformes, la sélection peut être reportée ; le report est publié à l'heure prévue.",
    },
  },
  {
    title: { vi: "Phần được tặng", en: "What's given", fr: "Ce qui est offert" },
    body: {
      vi: "Thiết kế và lập trình một trang web, đúng phạm vi công bố ở trên, trị giá 4.900.000₫, bàn giao trong 7 ngày kể từ khi nhận đủ nội dung.",
      en: "The design and build of a website matching the scope published above, worth 4,900,000₫, delivered within 7 days of receiving all content.",
      fr: "La conception et le développement d'une page conforme au périmètre publié ci-dessus, valeur 4.900.000₫, livrée sous 7 jours à compter de la réception de l'intégralité du contenu.",
    },
  },
  {
    title: { vi: "Phần tự trả", en: "What you pay", fr: "À votre charge" },
    body: {
      vi: "Phí mở dịch vụ 50 USD (~1.300.000₫), trả một lần trước khi lên sóng, và tên miền do anh/chị tự mua, đứng tên anh/chị. Neuraweb không cầm tiền tên miền.",
      en: "The setup fee of 50 USD (~1,300,000₫), paid once before launch, and the domain name, bought by you, in your name. Neuraweb never handles the domain payment.",
      fr: "Les frais de mise en service de 50 USD (~1.300.000₫), payés une seule fois avant la mise en ligne, et le nom de domaine acheté par vous, à votre nom. Neuraweb n'encaisse jamais le prix du domaine.",
    },
  },
  {
    title: { vi: "Thời hạn phản hồi", en: "Response window", fr: "Délai de réponse" },
    body: {
      vi: "Cơ sở được chọn có 5 ngày để xác nhận và gửi nội dung. Quá hạn, phần quà chuyển cho hồ sơ xếp ngay sau.",
      en: "The chosen business has 5 days to confirm and send its content. After that, the gift goes to the next-ranked entry.",
      fr: "L'établissement choisi dispose de 5 jours pour confirmer et transmettre son contenu. Passé ce délai, le lot va au dossier classé immédiatement après.",
    },
  },
  {
    title: { vi: "Quyền sở hữu", en: "Ownership", fr: "Propriété" },
    body: {
      vi: "Trang web và nội dung thuộc về cơ sở được chọn ngay khi thanh toán phí mở dịch vụ. Mã nguồn được bàn giao nếu anh/chị yêu cầu.",
      en: "The site and its content belong to the chosen business as soon as the setup fee is paid. The source code is handed over on request.",
      fr: "Le site et son contenu appartiennent à l'établissement dès le paiement des frais de mise en service. Le code est remis sur simple demande.",
    },
  },
  {
    title: { vi: "Điều kiện đi kèm", en: "Condition attached", fr: "Contrepartie" },
    body: {
      vi: "Tham gia đồng nghĩa với việc cho phép Neuraweb giới thiệu công trình, tên cơ sở, ảnh và địa chỉ trong portfolio và các kênh truyền thông của mình, không giới hạn thời gian, và giữ dòng « Thiết kế bởi Neuraweb » ở cuối trang. Điều kiện này không thương lượng.",
      en: "Entering means allowing Neuraweb to showcase the work, the business name, photos and address in its portfolio and communications, with no time limit, and to keep the « Thiết kế bởi Neuraweb » credit in the footer. This condition is not negotiable.",
      fr: "La participation vaut autorisation, sans limite de durée, pour Neuraweb de présenter la réalisation, le nom, les photos et l'adresse de l'établissement dans son portfolio et ses supports, et de conserver la mention « Thiết kế bởi Neuraweb » en pied de page. Clause non négociable.",
    },
  },
  {
    title: { vi: "Ngoài phạm vi", en: "Out of scope", fr: "Hors périmètre" },
    body: {
      vi: "Mọi yêu cầu ngoài phạm vi ở trên được báo giá riêng theo bảng giá công khai của Neuraweb.",
      en: "Any request outside the scope above is quoted separately, per Neuraweb's public price list.",
      fr: "Toute demande sortant du périmètre ci-dessus fait l'objet d'un devis selon la grille publique de Neuraweb.",
    },
  },
  {
    title: { vi: "Kết thúc sớm", en: "Early end", fr: "Fin anticipée" },
    body: {
      vi: "Neuraweb có thể kết thúc chương trình bất cứ lúc nào, báo trước 1 tuần trên trang. Cam kết với cơ sở đã công bố vẫn được thực hiện đầy đủ.",
      en: "Neuraweb may end the offer at any time, with one week's notice on the page. Commitments to an already-announced winner are fully honoured.",
      fr: "Neuraweb peut mettre fin à l'opération à tout moment, avec un préavis d'une semaine sur la page. Les engagements envers un établissement déjà annoncé sont honorés.",
    },
  },
  {
    title: { vi: "Thông tin cá nhân", en: "Personal data", fr: "Données personnelles" },
    body: {
      vi: "Chỉ dùng để xử lý lượt tham gia và liên hệ lại. Không bán, không chuyển cho bên thứ ba.",
      en: "Used only to process entries and to get back to you. Never sold, never shared with a third party.",
      fr: "Utilisées uniquement pour traiter la participation et recontacter les participants. Ni revendues, ni transmises à des tiers.",
    },
  },
];

export default function GiftPage() {
  const { t, tr } = useLanguage();

  return (
    <>
      {/* ────────────── L'annonce ────────────── */}
      <section className="bg-deep text-on-deep">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_22rem] lg:items-center">
          <div className="flex flex-col gap-7">
            <p className="text-[13px] uppercase tracking-[0.24em] text-[rgba(243,237,227,0.7)]">
              {t("giftKicker")}
            </p>

            <h1 className="max-w-2xl font-display text-[2.3rem] leading-[1.1] sm:text-5xl md:text-6xl">
              {t("giftHeroTitle")}
            </h1>

            <div>
              <p className="font-display text-gold text-[2.75rem] leading-none sm:text-6xl md:text-[4.5rem]">
                {formatVnd(KHOI_DAU.price!)}
              </p>
              <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-[rgba(243,237,227,0.7)]">
                {t("giftValueCaption")}
              </p>
            </div>

            <p className="max-w-xl text-[17px] leading-relaxed text-[rgba(243,237,227,0.85)]">
              {t("giftHeroLead")}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#tham-gia"
                className="tap rounded-full bg-gold px-6 text-[15px] font-medium text-deep transition-opacity hover:opacity-90"
              >
                {t("giftCtaSteps")}
              </a>
              <a
                href="#dieu-kien"
                className="tap rounded-full border border-[rgba(243,237,227,0.3)] px-6 text-[15px] font-medium transition-colors hover:border-on-deep"
              >
                {t("giftCtaTerms")}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[rgba(243,237,227,0.7)]">
              <span>21/09/2026 → 15/11/2026</span>
              <span aria-hidden>·</span>
              <span>{t("giftRun")}</span>
            </div>

            <p className="max-w-xl border-t border-[rgba(243,237,227,0.18)] pt-5 text-[13px] leading-relaxed text-[rgba(243,237,227,0.65)]">
              * {t("giftFootnote")}{" "}
              <a href="#dieu-kien" className="underline underline-offset-4 hover:text-on-deep">
                {t("giftFootnoteLink")}
              </a>
            </p>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl lg:max-w-none">
            <Image
              src="/vitrine/qua-tang-hero-affiche.webp"
              alt={t("giftHeroImageAlt")}
              fill
              preload
              sizes="(max-width: 1024px) 20rem, 22rem"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ────────────── Ce qui est offert ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
          {t("giftReceivesKicker")}
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
          {t("giftReceivesTitle")}
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GIFTS.map((g, i) => (
            <div
              key={g.title.vi}
              className="rounded-2xl border border-line bg-white p-5"
              data-reveal
              style={{ ["--d" as string]: `${80 + i * 60}ms` }}
            >
              <h3 className="text-[13px] font-medium uppercase tracking-[0.1em] text-gold">{tr(g.title)}</h3>
              <p className="mt-2 text-[15px] leading-snug">{tr(g.body)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 rounded-2xl bg-[rgba(184,137,43,0.08)] px-5 py-4">
          <p className="text-[15px] font-medium">{t("giftTotalLabel")}</p>
          <p className="font-display text-2xl text-gold">{formatVnd(KHOI_DAU.price!)}</p>
        </div>
      </section>

      {/* ────────────── Cách tham gia ────────────── */}
      <section id="tham-gia" className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
            {t("giftHowKicker")}
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
            {t("giftHowTitle")}
          </h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:items-center">
            <div className="flex gap-4" data-reveal="left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-medium text-ground">
                1
              </span>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1.5">
                <p className="text-[16px]">{t("giftStep1")}</p>
                <a
                  href={`https://facebook.com/${agency.facebookPage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tap text-[14px] font-medium underline underline-offset-4 hover:no-underline"
                >
                  {agency.name} ↗
                </a>
              </div>
            </div>

            <div className="relative mx-auto aspect-[3/2] w-full overflow-hidden rounded-2xl" data-reveal>
              <Image
                src="/vitrine/qua-tang-remise.webp"
                alt={t("giftHowImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>

            <div className="flex gap-4" data-reveal="right" style={{ ["--d" as string]: "60ms" }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-medium text-ground">
                2
              </span>
              <div className="min-w-0 flex-1">
                <p className="pt-1.5 text-[16px]">{t("giftStep2")}</p>
                <div className="mt-3 rounded-xl border border-line bg-white p-4 text-[14px] leading-relaxed text-muted">
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                    {t("giftCommentLabel")}
                  </p>
                  <p className="mt-1.5 italic text-ink">{t("giftCommentExample")}</p>
                </div>
                <p className="mt-2 text-[13px] text-muted">{t("giftNominateNote")}</p>
              </div>
            </div>
          </div>

          <p className="mt-6 flex items-baseline gap-2 rounded-xl bg-[rgba(184,137,43,0.08)] px-4 py-3 text-[14px]">
            <span aria-hidden className="text-gold">
              ✓
            </span>
            <span>{t("giftNoShare")}</span>
          </p>
        </div>
      </section>

      {/* ────────────── Comment le choix est fait ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
          {t("giftCriteriaKicker")}
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
          {t("giftCriteriaTitle")}
        </h2>
        <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal style={{ ["--d" as string]: "60ms" }}>
          {t("giftCriteriaLead")}
        </p>

        {/* Prérequis : un bloc à part, jamais dans la liste à barres pondérées — voir
            le commentaire sur `GATE` plus haut dans ce fichier. La conséquence de son
            absence est écrite en toutes lettres, pas laissée à un mot isolé. */}
        <div className="mt-8 max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
            {t("giftCriteriaGateKicker")}
          </p>
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-line bg-white p-4">
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-medium text-ground"
            >
              ✓
            </span>
            <p className="pt-0.5 text-[15px] font-medium">{tr(GATE.label)}</p>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{t("giftCriteriaGateNote")}</p>
        </div>

        <p
          className="mt-9 max-w-2xl text-[13px] font-medium uppercase tracking-[0.14em] text-muted"
          data-reveal
        >
          {t("giftCriteriaThenLabel")}
        </p>

        <div className="mt-4 flex max-w-2xl flex-col gap-5">
          {CRITERIA.map((c) => (
            <div key={c.label.vi}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[15px]">{tr(c.label)}</p>
                <p className="whitespace-nowrap text-[13px] font-medium text-muted">{c.weight}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-gold" style={{ width: `${c.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────── Lịch chương trình ────────────── */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
            {t("giftCalendarKicker")}
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
            {t("giftCalendarTitle")}
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {WEEKS.map((w) => (
              <div
                key={w.n}
                className={`rounded-xl border p-3.5 ${
                  w.flag ? "border-[rgba(184,137,43,0.35)] bg-[rgba(184,137,43,0.08)]" : "border-line bg-white"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                  {t("giftWeekLabel")} {w.n}/8
                </p>
                <p className="font-display text-lg">{w.date}</p>
                <p className={`mt-1 text-[13px] leading-snug ${w.flag ? "text-gold" : "text-muted"}`}>
                  {tr(w.theme)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 max-w-2xl text-[13px] text-muted">{t("giftCalendarNote")}</p>
        </div>
      </section>

      {/* ────────────── Bandeau ────────────── */}
      <section className="relative isolate h-64 overflow-hidden sm:h-80">
        <Image
          src="/vitrine/qua-tang-bande-pho-toi.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-deep/55" />
        <div className="relative mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
          <p className="font-display text-2xl text-on-deep sm:text-3xl">{t("giftBandeauCaption")}</p>
        </div>
      </section>

      {/* ────────────── Điều kiện ────────────── */}
      <section id="dieu-kien" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
          {t("giftTermsKicker")}
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
          {t("giftTermsTitle")}
        </h2>
        <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal style={{ ["--d" as string]: "60ms" }}>
          {t("giftTermsLead")}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[16px] font-medium">{t("giftServiceFeeTitle")}</h3>
              <p className="whitespace-nowrap font-display text-xl text-gold">{t("giftServiceFeeAmount")}</p>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">{t("giftServiceFeeNote")}</p>

            <details className="mt-4 border-t border-line pt-3">
              <summary className="cursor-pointer text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                {t("giftServiceFeeDetails")}
              </summary>
              <ul className="mt-3 space-y-1.5 text-[14px] text-muted">
                {SERVICE_FEE_ITEMS.map((item) => (
                  <li key={item.vi} className="flex items-baseline justify-between gap-4">
                    <span>{tr(item)}</span>
                    <span aria-hidden className="text-ink">
                      ✓
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[16px] font-medium">{t("giftDomainTitle")}</h3>
              <p className="whitespace-nowrap font-display text-xl text-gold">{t("giftDomainAmount")}</p>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">{t("giftDomainNote")}</p>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-display text-2xl">{t("giftExclusionsTitle")}</h3>
          <p className="mt-2 max-w-xl text-[15px] text-muted">{t("giftExclusionsLead")}</p>

          <ul className="mt-5">
            {EXCLUSIONS.map((x) => (
              <li
                key={x.what.vi}
                className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[15px]"
              >
                <span>{tr(x.what)}</span>
                <span className="whitespace-nowrap text-[13px] font-medium text-muted">
                  {"pack" in x.where ? tr(x.where.pack.gridName) : x.where.text}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[14px] text-muted">{t("giftFixNote")}</p>
        </div>
      </section>

      {/* ────────────── Thể lệ chương trình ────────────── */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
            {t("giftRulesKicker")}
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
            {t("giftRulesTitle")}
          </h2>

          <ol className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
            {RULES.map((r, i) => (
              <li key={r.title.vi} className="border-t border-line pt-4">
                <span className="font-display text-xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-1 text-[15px] font-medium">{tr(r.title)}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{tr(r.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ────────────── Mention obligatoire ────────────── */}
      <p className="mx-auto max-w-6xl px-4 pb-14 text-[13px] text-muted sm:px-6">{t("giftMetaDisclaimer")}</p>
    </>
  );
}
