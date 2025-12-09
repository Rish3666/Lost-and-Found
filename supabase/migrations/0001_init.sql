-- Lost & Found initial schema
-- Enums
create extension if not exists "uuid-ossp";

create type user_role as enum ('student', 'admin', 'staff');
create type item_type as enum ('LOST', 'FOUND');
create type item_category as enum ('ELECTRONICS', 'CLOTHING', 'ID_CARDS', 'KEYS', 'OTHER');
create type item_status as enum ('OPEN', 'CLAIMED', 'RESOLVED');
create type claim_status as enum ('PENDING', 'APPROVED', 'REJECTED');

-- Tables
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role user_role not null default 'student',
  university_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  type item_type not null,
  category item_category not null,
  location text,
  date_incident timestamptz,
  status item_status not null default 'OPEN',
  image_url text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.claims (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  status claim_status not null default 'PENDING',
  proof_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;

create policy "profiles select authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles update self"
  on public.profiles for update
  using (auth.uid() = id);

create policy "items select public"
  on public.items for select
  using (true);

create policy "items insert authenticated"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "items update owner"
  on public.items for update
  using (auth.uid() = user_id);

create policy "items delete owner"
  on public.items for delete
  using (auth.uid() = user_id);

create policy "claims select by claimant or owner"
  on public.claims for select
  using (
    auth.uid() = claimant_id
    or exists (
      select 1 from public.items i
      where i.id = claims.item_id and i.user_id = auth.uid()
    )
  );

create policy "claims insert authenticated"
  on public.claims for insert
  with check (auth.uid() = claimant_id);

create policy "claims update claimant"
  on public.claims for update
  using (auth.uid() = claimant_id);

-- Timestamp triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_items_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create trigger set_claims_updated_at
before update on public.claims
for each row execute function public.set_updated_at();

-- Profile bootstrap trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, university_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'student',
    new.raw_user_meta_data->>'university_id'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage bucket and policies
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

create policy "storage insert item-images auth"
  on storage.objects for insert
  with check (bucket_id = 'item-images' and auth.role() = 'authenticated');

create policy "storage select item-images public"
  on storage.objects for select
  using (bucket_id = 'item-images');

create policy "storage delete item-images owner"
  on storage.objects for delete
  using (
    bucket_id = 'item-images'
    and (auth.uid()::text) = (storage.foldername(name))[1]
  );

