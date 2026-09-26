-- Racha diaria: días marcados explícitamente como "sin gastos"
-- Las días con gastos se derivan de public.expenses; esta tabla cubre los días sin gastos.
-- Ejecuta esto en Supabase > SQL Editor (o viene incluido en schema.sql para proyectos nuevos)

create table if not exists public.day_marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists day_marks_user_date_idx on public.day_marks(user_id, date desc);

alter table public.day_marks enable row level security;

drop policy if exists "own day marks" on public.day_marks;
create policy "own day marks" on public.day_marks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
