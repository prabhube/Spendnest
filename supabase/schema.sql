-- SpendNest V1 schema for Supabase PostgreSQL
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  monthly_income numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  icon text not null default '📦',
  type text not null default 'expense' check (type in ('expense', 'income')),
  is_default boolean not null default false
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  relationship text not null default 'self'
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  amount numeric not null check (amount > 0),
  description text,
  expense_date date not null,
  payment_method text,
  family_member_id uuid references public.family_members(id),
  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  month integer not null check (month between 1 and 12),
  year integer not null,
  amount numeric not null check (amount >= 0)
);

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  amount numeric not null check (amount > 0),
  description text not null,
  frequency text not null default 'monthly' check (frequency in ('monthly', 'weekly', 'yearly')),
  due_day integer not null check (due_day between 1 and 31),
  start_date date not null,
  end_date date,
  is_active boolean not null default true
);

create index if not exists expenses_user_date_idx on public.expenses (user_id, expense_date desc);
create index if not exists budgets_user_month_idx on public.budgets (user_id, year, month);
create index if not exists categories_user_idx on public.categories (user_id);
create unique index if not exists budgets_total_unique_idx
  on public.budgets (user_id, month, year)
  where category_id is null;
create unique index if not exists budgets_category_unique_idx
  on public.budgets (user_id, category_id, month, year)
  where category_id is not null;

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.family_members enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_expenses enable row level security;

create policy "users_own_row" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "categories_own_rows" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "family_own_rows" on public.family_members
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "expenses_own_rows" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_own_rows" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "recurring_own_rows" on public.recurring_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
