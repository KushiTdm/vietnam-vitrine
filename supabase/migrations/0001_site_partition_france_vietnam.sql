-- ============================================================
-- Migration 0001 (Hanoi) — partition France / Vietnam
--
-- ⚠️ La base est celle de neuraweb.fr (projet Supabase « Social-neuraweb ») :
-- les migrations 0001 à 0008 vivent dans `Neuraweb-V2/project/supabase/`.
-- Celle-ci est la première écrite depuis le dépôt de Hanoi, d'où sa
-- numérotation repartie de 1 dans ce dossier.
--
-- Déjà APPLIQUÉE en base (le 24 sept. 2026, via le connecteur Supabase).
-- Conservée ici pour l'historique : sans elle, personne ne peut savoir d'où
-- vient la colonne `site` en relisant ce dépôt.
--
-- Neuraweb tient deux sites distincts qui partagent cette base :
--   'fr' → neuraweb.fr, offre française, prix en EUR
--   'vn' → la vitrine de Hanoi, offre vietnamienne, prix en dong
--
-- La colonne est NOT NULL DEFAULT 'fr' pour que tout le code français
-- existant continue d'écrire exactement comme avant, sans une ligne à
-- changer. Idempotent : ré-exécutable sans casse.
-- ============================================================

alter table public.chat_logs            add column if not exists site text not null default 'fr';
alter table public.chat_security_events add column if not exists site text not null default 'fr';
alter table public.bookings             add column if not exists site text not null default 'fr';
alter table public.booking_slots        add column if not exists site text not null default 'fr';

do $$
declare t text;
begin
  foreach t in array array['chat_logs','chat_security_events','bookings','booking_slots'] loop
    if not exists (
      select 1 from pg_constraint
      where conrelid = format('public.%I', t)::regclass and conname = t || '_site_check'
    ) then
      execute format(
        'alter table public.%I add constraint %I check (site in (''fr'',''vn''))',
        t, t || '_site_check'
      );
    end if;
  end loop;
end $$;

-- Intentions du chatbot. 'contact', 'faq' et 'cached' marquent les réponses
-- servies SANS appel payant au modèle : leur part mesure l'économie réelle.
alter table public.chat_logs drop constraint if exists chat_logs_intent_check;
alter table public.chat_logs add constraint chat_logs_intent_check
  check (intent in ('normal','booking','qualification','contact','faq','cached'));

-- On lit toujours une seule antenne à la fois.
create index if not exists chat_logs_site_created_idx
  on public.chat_logs (site, created_at desc);
create index if not exists chat_security_events_site_created_idx
  on public.chat_security_events (site, created_at desc);
create index if not exists bookings_site_date_idx
  on public.bookings (site, date);
create index if not exists booking_slots_site_date_idx
  on public.booking_slots (site, date);

-- Unicité PAR ANTENNE : un créneau de 10:00 à Hanoi et un créneau de 10:00 en
-- France sont deux moments différents. Sans le site dans la clé, réserver à
-- Hanoi bloquerait le même horaire à Paris.
alter table public.booking_slots drop constraint if exists booking_slots_date_time_key;
drop index if exists public.booking_slots_site_date_time_uidx;
create unique index booking_slots_site_date_time_uidx
  on public.booking_slots (site, date, "time");

drop index if exists public.bookings_date_time_active_uidx;
drop index if exists public.bookings_site_date_time_active_uidx;
create unique index bookings_site_date_time_active_uidx
  on public.bookings (site, date, "time")
  where status <> 'cancelled';
