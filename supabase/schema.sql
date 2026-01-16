-- ============================================
-- DRAFT 데이터베이스 스키마 v2
-- 마지막 수정: 2026-01-16
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- 신청 상태
create type application_status as enum (
  'PENDING',     -- 신청 완료, 입금/확인 대기
  'CONFIRMED',   -- 참가 확정
  'REJECTED',    -- 거절됨
  'CANCELED'     -- 취소됨
);

-- 포지션 타입
create type position_type as enum ('G', 'F', 'C');

-- ============================================
-- 1. 유저 (Users)
-- 설명: 카카오 로그인 정보 + 농구 프로필 + 인증 정보
-- ============================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,

  -- 신원 정보
  real_name text,           -- 실명 (계좌 실명 조회용)
  nickname text,            -- 앱 내 표시용 닉네임
  avatar_url text,          -- 프로필 사진

  -- 연락처 & 인증
  phone text,               -- 010-1234-5678
  phone_verified boolean default false,

  -- 농구 프로필
  positions text[],         -- ['G', 'F'] 배열로 저장
  manner_score float default 36.5,

  -- 메타 데이터 (확장성)
  -- 예: { "height": 180, "weight": 75, "kakao_id": 12345, "provider": "kakao" }
  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now()
);

-- ============================================
-- 2. 체육관 (Gyms)
-- 설명: 장소 정보 저장소
-- ============================================
create table public.gyms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,

  -- 시설 옵션 (JSONB)
  -- 예: { "parking": true, "shower": false, "court_type": "WOOD" }
  facilities jsonb default '{}'::jsonb,

  -- 카카오맵 연동
  kakao_place_id text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 3. 팀 (Teams) - 스키마만 생성, 코드 연동은 나중에
-- ============================================
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,

  -- 지역 및 홈구장
  region_depth1 text,       -- '서울'
  region_depth2 text,       -- '강남구'
  home_gym_id uuid references public.gyms,

  -- 팀 운영 정보
  description text,
  is_recruiting boolean default false,
  regular_schedule text,    -- "매주 목요일 20시"
  contact_link text,        -- 오픈채팅방 등

  -- 팀 대표 계좌
  account_bank text,
  account_number text,
  account_holder text,

  -- 팀 스펙 (검색 필터용)
  team_avg_level text,
  team_avg_age text,
  team_gender text,

  created_at timestamptz default now()
);

-- ============================================
-- 4. 팀 멤버 (Team Members) - 스키마만 생성
-- ============================================
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,

  role text default 'MEMBER',   -- 'LEADER', 'MANAGER', 'MEMBER'
  status text default 'ACCEPTED', -- 'PENDING', 'ACCEPTED'
  joined_at timestamptz default now(),

  unique(team_id, user_id)
);

-- ============================================
-- 5. 경기 매치 (Matches)
-- ============================================
create table public.matches (
  id uuid default gen_random_uuid() primary key,

  -- 주최자 & 장소
  host_id uuid references public.users not null,
  team_id uuid references public.teams,  -- NULL 가능 (개인 주최)
  gym_id uuid references public.gyms not null,

  -- 제목 & 설명
  title text not null,
  description text,

  -- 시간
  start_time timestamptz not null,
  end_time timestamptz,

  -- 경기 타입
  match_type text not null,           -- '5vs5', '3vs3'
  gender_rule text not null,          -- 'MALE', 'MIXED', 'FEMALE'
  level_limit text,                   -- 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL'

  -- 참가비 구조
  cost_type text not null default 'MONEY',  -- 'MONEY', 'FREE', 'BEVERAGE'
  cost_amount int default 0,                -- 금액(원) 또는 음료수 개수(병)
  provides_beverage boolean default false,   -- "물/음료 제공" 뱃지 표시용

  -- 입금 계좌 (개인 주최 시 사용)
  account_bank text,
  account_number text,
  account_holder text,

  -- 모집 인원 설정 (JSONB)
  -- type: 'ANY' → { "type": "ANY", "max_count": 10 }
  -- type: 'POSITION' → { "type": "POSITION", "positions": { "G": { "max": 2, "current": 0 }, ... }, "max_total": 8 }
  recruitment_setup jsonb not null default '{ "type": "ANY", "max_count": 10 }'::jsonb,

  -- 경기 상태
  status text default 'RECRUITING',   -- 'RECRUITING', 'CLOSED', 'FINISHED', 'CANCELED'

  -- 경기 옵션 (공, 조끼 등)
  match_options jsonb default '{}'::jsonb,

  created_at timestamptz default now()
);

-- ============================================
-- 6. 신청서 (Applications)
-- ============================================
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,

  position position_type not null,
  status application_status default 'PENDING',

  -- 취소 사유 (선택)
  cancellation_reason text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
create index idx_users_email on users(email);
create index idx_users_phone on users(phone) where phone is not null;

-- Gyms
create index idx_gyms_name on gyms(name);
create index idx_gyms_location on gyms(latitude, longitude);
create unique index idx_gyms_kakao on gyms(kakao_place_id) where kakao_place_id is not null;

-- Teams
create index idx_teams_region on teams(region_depth1, region_depth2);

-- Matches
create index idx_matches_status_time on matches(status, start_time);
create index idx_matches_host on matches(host_id);
create index idx_matches_gym on matches(gym_id);
create index idx_matches_filters on matches(status, gender_rule, level_limit, match_type);

-- Applications
create index idx_applications_match on applications(match_id);
create index idx_applications_user on applications(user_id);
-- 소프트 유니크 제약: 취소되지 않은 신청만 중복 방지
create unique index idx_applications_unique_active
on applications(match_id, user_id)
where status != 'CANCELED';

-- ============================================
-- RLS POLICIES
-- ============================================

alter table users enable row level security;
alter table gyms enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table matches enable row level security;
alter table applications enable row level security;

-- Users: 공개 읽기, 본인만 수정
create policy "Users are viewable by everyone" on users for select using (true);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = id);

-- Gyms: 공개 읽기, 누구나 생성/수정 (Upsert용)
create policy "Gyms are viewable by everyone" on gyms for select using (true);
create policy "Anyone can create gyms" on gyms for insert with check (true);
create policy "Anyone can update gyms" on gyms for update using (true);

-- Teams: 공개 읽기 (나중에 확장)
create policy "Teams are viewable by everyone" on teams for select using (true);
create policy "Anyone can create teams (DEV)" on teams for insert with check (true);

-- Team Members: 공개 읽기 (나중에 확장)
create policy "Team members are viewable by everyone" on team_members for select using (true);

-- Matches: 공개 읽기, 호스트만 수정
create policy "Matches are viewable by everyone" on matches for select using (true);
-- 개발 테스트용 정책:
create policy "Anyone can create matches (DEV)" on matches for insert with check (true);
-- 프로덕션 정책 (OAuth 설정 후):
-- create policy "Users can create matches" on matches for insert with check (auth.uid() = host_id);
create policy "Hosts can update own matches" on matches for update using (auth.uid() = host_id);

-- Applications
create policy "Users can view own applications" on applications for select
  using (auth.uid() = user_id);
create policy "Hosts can view applications for their matches" on applications for select
  using (exists (select 1 from matches where id = applications.match_id and host_id = auth.uid()));
create policy "Anyone can create applications (DEV)" on applications for insert with check (true);
-- 프로덕션:
-- create policy "Users can create applications" on applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on applications for update using (auth.uid() = user_id);
create policy "Hosts can update applications" on applications for update
  using (exists (select 1 from matches where id = applications.match_id and host_id = auth.uid()));

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- 1. 회원가입 시 users 테이블 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Gyms updated_at 자동 갱신
create or replace function update_gyms_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_gyms_update
  before update on gyms
  for each row execute function update_gyms_updated_at();

-- 3. Applications updated_at 자동 갱신
create or replace function update_applications_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_applications_update
  before update on applications
  for each row execute function update_applications_updated_at();

-- 4. 노쇼 시 매너 점수 감점
create or replace function penalize_noshow()
returns trigger as $$
begin
  if (new.status = 'REJECTED' and old.status = 'CONFIRMED') then
    -- 호스트가 확정 후 거절 시 노쇼 처리 (향후 noshow 상태 추가 가능)
    update users set manner_score = manner_score - 5.0 where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_application_noshow
  after update on applications
  for each row execute function penalize_noshow();

-- ============================================
-- 개발용 테스트 데이터 (선택)
-- ============================================

-- 테스트 유저 (Supabase Auth에 먼저 생성 필요)
-- insert into users (id, email, nickname, positions)
-- values ('d1011295-3375-41f4-83c7-9663dc00becf', 'test@naver.com', '테스트유저', array['G', 'F']);
