-- =============================================
-- Level/Age Range JSONB Migration
-- =============================================
--
-- 이 마이그레이션은 다음을 수행합니다:
-- 1. matches 테이블에 level_range, age_range JSONB 컬럼 추가
-- 2. 기존 level_limit 데이터를 level_range로 마이그레이션
-- 3. match_rule에 있던 skill_level_min/max도 level_range로 통합
--
-- 구조:
--   level_range: { "min": 1, "max": 7 }
--   age_range: { "min": 20, "max": 40 } 또는 { "min": 30, "max": null } (null = "이상")
--
-- =============================================

-- =============================================
-- 1. MATCHES 테이블 업데이트
-- =============================================

-- 1.1 새 JSONB 컬럼 추가
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS level_range JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age_range JSONB DEFAULT NULL;

-- 1.2 기존 level_limit 데이터 마이그레이션
-- level_limit이 단일 숫자인 경우 min=max로 설정
UPDATE matches SET
  level_range = jsonb_build_object(
    'min', COALESCE(level_limit::int, 1),
    'max', COALESCE(level_limit::int, 7)
  )
WHERE level_range IS NULL
  AND level_limit IS NOT NULL;

-- 1.3 match_rule에서 skill_level_min/max가 있는 경우 마이그레이션
UPDATE matches SET
  level_range = jsonb_build_object(
    'min', COALESCE((match_rule->>'skill_level_min')::int, 1),
    'max', COALESCE((match_rule->>'skill_level_max')::int, 7)
  )
WHERE level_range IS NULL
  AND match_rule IS NOT NULL
  AND (match_rule->>'skill_level_min' IS NOT NULL OR match_rule->>'skill_level_max' IS NOT NULL);

-- 1.4 기본값 설정 (level_range가 없는 레코드)
UPDATE matches SET
  level_range = jsonb_build_object('min', 1, 'max', 7)
WHERE level_range IS NULL;

-- =============================================
-- 2. match_rule에서 skill_level 필드 제거 (정리)
-- =============================================

-- match_rule에서 skill_level_min, skill_level_max 키 제거
UPDATE matches SET
  match_rule = match_rule - 'skill_level_min' - 'skill_level_max'
WHERE match_rule IS NOT NULL
  AND (match_rule ? 'skill_level_min' OR match_rule ? 'skill_level_max');

-- =============================================
-- 3. 인덱스 추가 (성능 최적화)
-- =============================================

-- JSONB 필드에 GIN 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_matches_level_range ON matches USING GIN (level_range);
CREATE INDEX IF NOT EXISTS idx_matches_age_range ON matches USING GIN (age_range);

-- 범위 검색용 B-tree 인덱스 (JSONB 내부 값)
CREATE INDEX IF NOT EXISTS idx_matches_level_min ON matches ((level_range->>'min'));
CREATE INDEX IF NOT EXISTS idx_matches_level_max ON matches ((level_range->>'max'));

-- =============================================
-- 4. 레거시 컬럼 제거 (선택적 - 데이터 확인 후)
-- =============================================

-- 주석 처리: 확인 후 실행
-- ALTER TABLE matches DROP COLUMN IF EXISTS level_limit;

-- =============================================
-- 5. 검증 쿼리
-- =============================================

-- 마이그레이션 결과 확인
SELECT
  'level_range migration' as check_name,
  COUNT(*) as total,
  COUNT(level_range) as with_level_range,
  COUNT(age_range) as with_age_range,
  COUNT(level_limit) as with_level_limit_legacy
FROM matches;

-- =============================================
-- 완료
-- =============================================
