-- Reinicio de racha: punto de corte (no borra gastos)
-- Ejecuta esto en Supabase > SQL Editor

alter table public.profiles
  add column if not exists streak_reset_at timestamptz;
