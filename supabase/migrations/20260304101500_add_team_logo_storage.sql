-- ============================================
-- Team Logo Storage Bucket + RLS Policies
-- ============================================

-- 1) Bucket 생성/업데이트 (멱등)
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'team-logos',
  'team-logos',
  true,
  3145728,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) 기존 정책 제거 (멱등)
DROP POLICY IF EXISTS "team_logos_select" ON storage.objects;
DROP POLICY IF EXISTS "team_logos_insert_authenticated_user_folder" ON storage.objects;
DROP POLICY IF EXISTS "team_logos_update_authenticated_user_folder" ON storage.objects;
DROP POLICY IF EXISTS "team_logos_delete_authenticated_user_folder" ON storage.objects;

-- 3) 조회 정책: public 로고 조회 허용
CREATE POLICY "team_logos_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logos');

-- 4) 업로드 정책: 인증 사용자 + 본인 경로(teams/{uid}/...)
CREATE POLICY "team_logos_insert_authenticated_user_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-logos'
  AND (storage.foldername(name))[1] = 'teams'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 5) 수정 정책: 인증 사용자 + 본인 경로(teams/{uid}/...)
CREATE POLICY "team_logos_update_authenticated_user_folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-logos'
  AND (storage.foldername(name))[1] = 'teams'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'team-logos'
  AND (storage.foldername(name))[1] = 'teams'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 6) 삭제 정책: 인증 사용자 + 본인 경로(teams/{uid}/...)
CREATE POLICY "team_logos_delete_authenticated_user_folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-logos'
  AND (storage.foldername(name))[1] = 'teams'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
