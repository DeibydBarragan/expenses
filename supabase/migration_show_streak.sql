-- Visibilidad del widget de racha
-- Ejecuta esto en Supabase > SQL Editor

alter table public.profiles
  add column if not exists show_streak boolean not null default true;
