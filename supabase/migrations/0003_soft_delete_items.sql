-- Add soft delete columns to items table
alter table public.items 
add column is_deleted boolean not null default false,
add column deleted_at timestamptz;

-- Update RLS policies to allow admins to see deleted items (or keep existing one if it uses 'true')
-- The existing policy "items select public" uses (true), so public can see deleted items unless we filter them in the query or update the policy.
-- Ideally, we might want to hide deleted items from public view in RLS, but for now we will filter in the application layer to match the request scope.
-- However, preventing public access to deleted items is better practice.

drop policy if exists "items select public" on public.items;

create policy "items select public"
  on public.items for select
  using (is_deleted = false);

create policy "items select admin"
  on public.items for select
  using (
    -- Allow admins to see everything
    (auth.role() = 'authenticated' and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ))
    OR
    -- Allow owners to see their own deleted items? (Optional, maybe for 'My Items' history)
    (auth.uid() = user_id)
  );

-- Update stats to only count active items (optional, but good for accuracy)
-- This depends on how stats are calculated. If using count(*), it will respect RLS.
