-- ============================================
-- Migration: Add Operations Info to Users Table
-- Date: 2026-01-20
-- Purpose: 경기 생성 시 운영 정보 섹션을 위한 기본값 컬럼 추가
-- ============================================

-- 1. Users 테이블에 운영 정보 기본값 컬럼 추가
alter table public.users 
add column if not exists default_account_bank text null,
add column if not exists default_account_number text null,
add column if not exists default_account_holder text null,
add column if not exists default_contact_type text default 'PHONE',
add column if not exists kakao_open_chat_url text null,
add column if not exists default_host_notice text null;

-- 2. Contact type validation constraint 추가
alter table public.users 
add constraint users_contact_type_check 
check (default_contact_type in ('PHONE', 'KAKAO_OPEN_CHAT') or default_contact_type is null);

-- 3. Matches 테이블의 contact_type 값 통일 (KAKAO_OPEN -> KAKAO_OPEN_CHAT)
-- 기존 데이터가 있다면 업데이트
update public.matches 
set contact_type = 'KAKAO_OPEN_CHAT' 
where contact_type = 'KAKAO_OPEN';

-- 4. schema.sql 주석 업데이트를 위한 참고사항
-- contact_type: 'PHONE' | 'KAKAO_OPEN_CHAT' (통일됨)

-- 5. 기존 유저들에게 기본 연락 수단 설정 (선택적)
-- 이미 phone이 있는 유저는 PHONE으로 기본값 설정
update public.users 
set default_contact_type = 'PHONE' 
where default_contact_type is null and phone is not null;

-- 6. Comment 추가 (문서화)
comment on column public.users.default_account_bank is '개인 주최 시 사용할 기본 은행명';
comment on column public.users.default_account_number is '개인 주최 시 사용할 기본 계좌번호';
comment on column public.users.default_account_holder is '개인 주최 시 사용할 기본 예금주';
comment on column public.users.default_contact_type is '선호하는 연락 수단: PHONE | KAKAO_OPEN_CHAT';
comment on column public.users.kakao_open_chat_url is '카카오 오픈채팅방 URL';
comment on column public.users.default_host_notice is '개인 주최 시 기본 공지사항';
