-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMS
create type application_status as enum (
  'pending_payment',      -- 신청 완료, 입금 대기
  'verification_pending', -- 입금 완료, 확인 대기
  'confirmed',            -- 참가 확정
  'rejected',             -- 거절됨
  'cancelled',            -- 취소됨 (게스트 요청)
  'noshow'                -- 노쇼 (호스트 신고)
);

create type position_type as enum ('guard', 'forward', 'center');

-- TABLES

-- 1. Profiles (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  nickname text,
  avatar_url text,
  height numeric,
  position position_type,
  manner_score numeric default 36.5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Matches
create table matches (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location_name text not null,
  location_address text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  fee numeric default 0,
  
  -- Required Players
  max_guards integer default 0,
  max_forwards integer default 0,
  max_centers integer default 0,
  
  -- Current Vacancy (Denormalized for quick access, maintained by triggers)
  vacancy_guards integer default 0,
  vacancy_forwards integer default 0,
  vacancy_centers integer default 0,

  status text default 'recruiting', -- recruiting, closed, finished
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Applications
create table applications (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references matches(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  position position_type not null,
  status application_status default 'pending_payment',
  cancellation_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(match_id, user_id)
);

-- RLS POLICIES
alter table profiles enable row level security;
alter table matches enable row level security;
alter table applications enable row level security;

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Matches: Public read, Host create/update
create policy "Matches are viewable by everyone" on matches for select using (true);
create policy "Users can create matches" on matches for insert with check (auth.uid() = host_id);
create policy "Hosts can update own matches" on matches for update using (auth.uid() = host_id);

-- Applications: Host can view all for their match, User can view own
create policy "Hosts can view applications for their matches" on applications for select 
  using (exists (select 1 from matches where id = applications.match_id and host_id = auth.uid()));

create policy "Users can view own applications" on applications for select using (auth.uid() = user_id);

create policy "Users can create applications" on applications for insert with check (auth.uid() = user_id);

create policy "Users can update own applications" on applications for update using (auth.uid() = user_id);
create policy "Hosts can update applications (approve/reject)" on applications for update 
  using (exists (select 1 from matches where id = applications.match_id and host_id = auth.uid()));

-- TRIGGERS & FUNCTIONS

-- 1. Vacancy Management
-- When application is 'confirmed', decrease vacancy.
-- When application is 'cancelled' or 'rejected', increase vacancy.

create or replace function update_vacancy()
returns trigger as $$
begin
  -- Case: New Confirmation
  if (new.status = 'confirmed' and (old.status is null or old.status != 'confirmed')) then
    execute format('update matches set vacancy_%s = vacancy_%s - 1 where id = $1', new.position, new.position) using new.match_id;
  end if;

  -- Case: Cancellation (Restoring vacancy)
  if ((new.status = 'cancelled' or new.status = 'rejected') and old.status = 'confirmed') then
    execute format('update matches set vacancy_%s = vacancy_%s + 1 where id = $1', new.position, new.position) using new.match_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger on_application_status_change
after update on applications
for each row execute function update_vacancy();

-- 2. Manner Score Penalty
-- When status becomes 'noshow', deduct 5 points from profile
create or replace function penalize_noshow()
returns trigger as $$
begin
  if (new.status = 'noshow' and old.status != 'noshow') then
    update profiles set manner_score = manner_score - 5.0 where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_noshow
after update on applications
for each row execute function penalize_noshow();
