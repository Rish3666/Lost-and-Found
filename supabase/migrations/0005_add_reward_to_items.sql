-- Add reward_amount to items table
alter table public.items 
add column if not exists reward_amount numeric default null;
