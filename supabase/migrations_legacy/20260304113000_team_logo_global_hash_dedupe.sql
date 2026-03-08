-- ============================================
-- Team Logo Global Hash Dedupe Insert Policy
-- ============================================

-- 기존 insert 정책 교체: 사용자 폴더 + 전역 해시 경로 허용
DROP POLICY IF EXISTS "team_logos_insert_authenticated_user_folder" ON storage.objects;

CREATE POLICY "team_logos_insert_authenticated_user_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-logos'
  AND (
    (
      (storage.foldername(name))[1] = 'teams'
      AND (storage.foldername(name))[2] = auth.uid()::text
    )
    OR (
      name ~ '^global/logo-[0-9a-f]{64}\\.(webp|jpg|png)$'
    )
  )
);
