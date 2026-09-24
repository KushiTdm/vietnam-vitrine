-- ============================================================
-- Migration 0002 (Hanoi) — le contact d'un RDV
--
-- Déjà APPLIQUÉE en base (24 sept. 2026, via le connecteur Supabase).
--
-- À Hanoi, le canal de rappel est Zalo, pas l'e-mail : exiger une adresse
-- ferait abandonner le formulaire. `email` devient donc facultative, et la
-- règle « au moins un moyen de rappeler » passe de la validation applicative
-- à une contrainte de base — elle vaut alors aussi pour les RDV saisis à la
-- main depuis l'app mobile.
--
-- Côté France, rien ne change : le formulaire y envoie toujours un e-mail.
-- ============================================================

alter table public.bookings alter column email drop not null;

alter table public.bookings drop constraint if exists bookings_contact_check;
alter table public.bookings add constraint bookings_contact_check
  check (
    (email is not null and length(btrim(email)) > 0)
    or (phone is not null and length(btrim(phone)) > 0)
  );
