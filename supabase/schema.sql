-- expenses · esquema Supabase
-- Ejecuta esto en Supabase > SQL Editor

-- 1. Perfiles (1 por usuario de auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  currency text not null default 'COP',
  created_at timestamptz default now()
);

-- 2. Categorías
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '◦',
  color text not null default '#A8A29E',
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- 3. Gastos
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  date date not null default current_date,
  created_at timestamptz default now()
);

create index if not exists expenses_user_date_idx on public.expenses(user_id, date desc);
create index if not exists expenses_user_cat_idx on public.expenses(user_id, category_id);

-- 3b. Días marcados como "sin gastos" (para la racha diaria)
create table if not exists public.day_marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists day_marks_user_date_idx on public.day_marks(user_id, date desc);

-- 4. RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.day_marks enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own categories" on public.categories;
create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own expenses" on public.expenses;
create policy "own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own day marks" on public.day_marks;
create policy "own day marks" on public.day_marks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. Crear perfil + categorías por defecto al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  chosen_currency text := coalesce((new.raw_user_meta_data ->> 'currency'), 'COP');
  chosen_name text := coalesce((new.raw_user_meta_data ->> 'name'), split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, name, currency)
  values (new.id, chosen_name, chosen_currency)
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, icon, color) values
    (new.id, 'Comida', 'food', '#F97316'),
    (new.id, 'Transporte', 'transport', '#2563EB'),
    (new.id, 'Casa', 'home', '#9333EA'),
    (new.id, 'Salud', 'health', '#16A34A'),
    (new.id, 'Ocio', 'fun', '#DB2777'),
    (new.id, 'Compras', 'shopping', '#0891B2'),
    (new.id, 'Servicios', 'bills', '#65A30D'),
    (new.id, 'Otros', 'other', '#64748B')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
