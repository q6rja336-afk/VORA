-- 1. Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user' check (role in ('admin', 'user')),
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. Create policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 4. Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Content Table (If not already created)
create table if not exists public.content (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text check (type in ('movie', 'series')),
  genre text[],
  year integer,
  rating text,
  score float,
  duration text,
  language text,
  seasons integer,
  episodes integer,
  poster_url text,
  backdrop_url text,
  video_url text,
  seasons_data jsonb, -- To store episodes per season: [{season: 1, episodes: ["url1", ...]}, ...]
  is_featured boolean default false,
  is_trending boolean default false,
  is_new boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.content enable row level security;

create policy "Content is viewable by everyone" on public.content
  for select using (true);

create policy "Content is manageable by admins only" on public.content
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
