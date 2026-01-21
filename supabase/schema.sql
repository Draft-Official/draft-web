-- ============================================
-- DRAFT 데이터베이스 스키마 v3
-- 마지막 수정: 2026-01-16 (최종 요구사항 반영)
-- ============================================

-- 1. UUID 확장 기능 활성화
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS (열거형 타입 정의)
-- ============================================

-- 신청 상태 (기존 유지)
create type application_status as enum (
  'PENDING',     -- 신청 완료, 입금/확인 대기
  'CONFIRMED',   -- 참가 확정
  'REJECTED',    -- 거절됨 (호스트가 거절)
  'CANCELED'     -- 취소됨 (신청자가 취소)
);

-- ============================================
-- 2. 유저 (Users)
-- 변경점: positions에 'B'(빅맨) 개념은 텍스트 배열로 처리하므로 별도 Enum 없음
-- ============================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,

  -- 👤 신원 정보
  real_name text,           -- 실명 (계좌 실명 조회용)
  nickname text,            -- 앱 내 표시용 닉네임
  avatar_url text,          -- 프로필 사진

  -- 📞 연락처 & 인증
  phone text,               -- 010-1234-5678
  phone_verified boolean default false,

  -- 🏀 농구 프로필 (변경: ['G', 'F', 'C', 'B'] 저장 가능)
  positions text[],         
  manner_score float default 36.5,

  -- 💰 개인 주최 기본 계좌 정보
  default_account_bank text,
  default_account_number text,
  default_account_holder text,

  -- 📞 연락처 기본 설정
  default_contact_type text default 'PHONE',  -- 'PHONE' | 'KAKAO_OPEN_CHAT'
  kakao_open_chat_url text,

  -- 📝 개인 주최 기본 공지사항
  default_host_notice text,

  -- 🔥 메타 데이터
  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now()
);

-- ============================================
-- 3. 체육관 (Gyms)
-- 변경점: facilities JSONB 구조화 (주차 위치, 코트 크기 등)
-- ============================================
create table public.gyms (
  id uuid default gen_random_uuid() primary key,
  name text not null,       -- "강남구민회관"
  address text not null,    -- 주소
  latitude double precision,
  longitude double precision,

  -- 🔥 시설 옵션 (JSONB)
  -- { "parking": true, "parking_location": "B2", "court_size_type": "SHORT" ... }
  facilities jsonb default '{}'::jsonb,

  kakao_place_id text,      -- 카카오맵 연동용 ID

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 4. 팀 (Teams)
-- 변경점: description -> host_notice
-- ============================================
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,

  -- 지역 및 홈구장
  region_depth1 text,       -- '서울'
  region_depth2 text,       -- '강남구'
  home_gym_id uuid references public.gyms,

  -- 📝 팀 운영 정보 (변경: host_notice)
  host_notice text,         -- 팀 소개 및 공지
  
  is_recruiting boolean default false,
  regular_schedule text,    -- "매주 목요일 20시"
  contact_link text,        -- 오픈채팅방 등

  -- 💰 팀 대표 계좌
  account_bank text,
  account_number text,
  account_holder text,

  -- 📊 팀 스펙
  team_avg_level text,
  team_avg_age text,
  team_gender text,

  created_at timestamptz default now()
);

-- ============================================
-- 5. 팀 멤버 (Team Members)
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
-- 6. 경기 매치 (Matches)
-- 변경점: manual_team_name, contact_type 필수, host_notice 변경
-- ============================================
create table public.matches (
  id uuid default gen_random_uuid() primary key,

  -- 👤 주최자 & 장소
  host_id uuid references public.users not null,
  team_id uuid references public.teams, -- NULL 가능 (개인 주최)
  gym_id uuid references public.gyms not null, -- 무조건 Gym 참조

  -- 🚨 [필수] 팀 ID가 없어도 표시할 팀명/호스트명 (NOT NULL)
  manual_team_name text not null,

  -- 📞 [필수] 연락처 타입 (NOT NULL)
  contact_type text not null default 'PHONE', -- 'PHONE' | 'KAKAO_OPEN_CHAT'
  contact_content text, -- 링크나 번호

  -- 📝 [변경] 공지사항 (기존 description)
  host_notice text,

  -- ⏰ 시간
  start_time timestamptz not null,
  end_time timestamptz not null,

  -- ⚖️ 경기 타입
  match_type text not null,           -- '5vs5', '3vs3'
  gender_rule text not null,          -- 'MALE', 'MIXED', 'FEMALE'
  level_limit text,                   -- 'BEGINNER', 'ALL'

  -- 💰 참가비 구조
  cost_type text not null default 'MONEY',  -- 'MONEY', 'FREE', 'BEVERAGE'
  cost_amount int default 0,                -- 금액(원) 또는 수량(개)
  provides_beverage boolean default false,  -- "물/음료 제공" 뱃지

  -- 🏦 입금 계좌 (개인 주최용)
  account_bank text,
  account_number text,
  account_holder text,

  -- 👥 모집 인원 설정 (JSONB) - 빅맨(B) 포함 가능
  -- { "type": "POSITION", "positions": { "B": { "max": 2, "current": 0 } } }
  recruitment_setup jsonb not null default '{ "type": "ANY", "max_count": 10 }'::jsonb,

  -- 상태
  status text default 'RECRUITING',   -- 'RECRUITING', 'CLOSED', 'FINISHED'

  -- 🔥 경기 옵션 (진행 방식, 쿼터, 심판 등)
  match_options jsonb default '{}'::jsonb,

  created_at timestamptz default now()
);

-- ============================================
-- 7. 신청서 (Applications)
-- 변경점: 동반 인원 처리를 위해 participants_info 사용
-- ============================================
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,

  status application_status default 'PENDING',

  -- 🔥 [JSONB] 참여자 명단 (본인 + 동반인)
  -- [{ "type": "MAIN", "position": "G" }, { "type": "GUEST", "position": "C" }]
  participants_info jsonb default '[]'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES (성능 최적화)
-- ============================================

-- Users
create index idx_users_email on users(email);
create index idx_users_phone on users(phone);

-- Gyms
create index idx_gyms_name on gyms(name);
create index idx_gyms_location on gyms(latitude, longitude);

-- Matches (검색 필터 최적화)
create index idx_matches_host on matches(host_id);
create index idx_matches_gym on matches(gym_id);
create index idx_matches_status_time on matches(status, start_time); 
-- 복합 인덱스: 모집중인 경기 중 날짜순 정렬 시 빠름

-- Applications
create index idx_applications_match on applications(match_id);
create index idx_applications_user on applications(user_id);
-- 중복 신청 방지 (취소 상태가 아닌 경우)
create unique index idx_applications_unique_active
on applications(match_id, user_id)
where status != 'CANCELED';

-- ============================================
-- RLS (보안 정책) - 개발용(DEV)으로 전체 허용 상태
-- ============================================

alter table users enable row level security;
alter table gyms enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table matches enable row level security;
alter table applications enable row level security;

-- 1. Users
create policy "Public profiles" on users for select using (true);
create policy "Self update" on users for update using (auth.uid() = id);
create policy "Self insert" on users for insert with check (auth.uid() = id);

-- 2. Gyms (누구나 읽기/쓰기 가능 - Upsert 위해)
create policy "Public gyms" on gyms for select using (true);
create policy "Insert gyms" on gyms for insert with check (true);

-- 3. Teams
create policy "Public teams" on teams for select using (true);
create policy "Insert teams" on teams for insert with check (true);

-- 4. Matches
create policy "Public matches" on matches for select using (true);
create policy "Insert matches" on matches for insert with check (true);
create policy "Host update matches" on matches for update using (auth.uid() = host_id);

-- 5. Applications
create policy "View own or host applications" on applications for select
  using (auth.uid() = user_id or exists (
    select 1 from matches where id = applications.match_id and host_id = auth.uid()
  ));
create policy "Insert applications" on applications for insert with check (true);
create policy "Update applications" on applications for update using (true);

-- ============================================
-- TRIGGERS (자동화)
-- ============================================

-- 1. 회원가입 자동 처리
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nickname, avatar_url)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. updated_at 자동 갱신 함수
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_gyms_timestamp before update on gyms
  for each row execute function update_updated_at();

create trigger update_applications_timestamp before update on applications
  for each row execute function update_updated_at();