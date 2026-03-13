CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, avatar_url, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'nickname',
      NEW.raw_user_meta_data->>'full_name',
      '사용자'
    ),
    NULL,
    jsonb_build_object('avatar_source', 'default')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nickname = COALESCE(EXCLUDED.nickname, public.users.nickname),
    avatar_url = public.users.avatar_url,
    metadata = COALESCE(public.users.metadata, '{}'::jsonb)
      || jsonb_build_object(
        'avatar_source',
        COALESCE(public.users.metadata->>'avatar_source', 'default')
      );
  RETURN NEW;
END;
$$;

UPDATE public.users
SET metadata = COALESCE(metadata, '{}'::jsonb)
  || jsonb_build_object(
    'avatar_source',
    CASE WHEN avatar_url IS NULL THEN 'default' ELSE 'kakao' END
  )
WHERE COALESCE(metadata->>'avatar_source', '') = '';

UPDATE public.users AS users
SET avatar_url = NULL,
    metadata = COALESCE(users.metadata, '{}'::jsonb)
      || jsonb_build_object('avatar_source', 'default')
FROM auth.users AS auth_users
WHERE users.id = auth_users.id
  AND users.avatar_url IS NOT NULL
  AND users.avatar_url IN (
    auth_users.raw_user_meta_data->>'avatar_url',
    auth_users.raw_user_meta_data->>'picture'
  );
