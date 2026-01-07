-- Create instagram_reels table
create table if not exists instagram_reels (
  id uuid default gen_random_uuid() primary key,
  embed_id text not null,
  label text,
  views text,
  thumbnail_url text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table instagram_reels enable row level security;

create policy "Allow public read access"
  on instagram_reels for select
  using (true);

create policy "Allow authenticated insert"
  on instagram_reels for insert
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated update"
  on instagram_reels for update
  using (auth.role() = 'authenticated');

create policy "Allow authenticated delete"
  on instagram_reels for delete
  using (auth.role() = 'authenticated');
