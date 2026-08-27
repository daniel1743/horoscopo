-- Comentarios moderables y seguimiento voluntario de perfiles públicos.
-- Ejecutar manualmente después del lote 06.
-- Este archivo no ha sido aplicado remotamente por el agente.

CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'hidden', 'deleted', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_post_comments_feed_idx
  ON public.community_post_comments (post_id, status, created_at ASC);
CREATE INDEX IF NOT EXISTS community_post_comments_user_idx
  ON public.community_post_comments (user_id, created_at DESC);

REVOKE ALL ON TABLE public.community_post_comments FROM anon, public;
GRANT SELECT, INSERT, DELETE ON TABLE public.community_post_comments TO authenticated;
GRANT ALL ON TABLE public.community_post_comments TO service_role;

ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community comments owner select" ON public.community_post_comments;
CREATE POLICY "community comments owner select"
  ON public.community_post_comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "community comments owner insert" ON public.community_post_comments;
CREATE POLICY "community comments owner insert"
  ON public.community_post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.community_posts AS post
      WHERE post.id = post_id
        AND post.visibility = 'public'
        AND post.status = 'published'
    )
  );

DROP POLICY IF EXISTS "community comments owner delete" ON public.community_post_comments;
CREATE POLICY "community comments owner delete"
  ON public.community_post_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS community_post_comments_set_updated_at
  ON public.community_post_comments;
CREATE TRIGGER community_post_comments_set_updated_at
  BEFORE UPDATE ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP FUNCTION IF EXISTS public.list_public_community_comments(UUID, INTEGER);
CREATE FUNCTION public.list_public_community_comments(
  p_post_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  post_id UUID,
  body TEXT,
  created_at TIMESTAMPTZ,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  author_aura_style TEXT,
  owned_by_viewer BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    comment.id,
    comment.post_id,
    comment.body,
    comment.created_at,
    profile.username,
    profile.display_name,
    profile.avatar_url,
    profile.aura_style,
    auth.uid() = comment.user_id
  FROM public.community_post_comments AS comment
  INNER JOIN public.community_posts AS post ON post.id = comment.post_id
  INNER JOIN public.profiles AS profile ON profile.id = comment.user_id
  WHERE comment.post_id = p_post_id
    AND comment.status = 'published'
    AND post.visibility = 'public'
    AND post.status = 'published'
    AND profile.profile_visibility = 'public'
    AND profile.username IS NOT NULL
  ORDER BY comment.created_at ASC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.list_public_community_comments(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_community_comments(UUID, INTEGER) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.community_profile_follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS community_profile_follows_followed_idx
  ON public.community_profile_follows (followed_id, created_at DESC);

REVOKE ALL ON TABLE public.community_profile_follows FROM anon, public;
GRANT SELECT, INSERT, DELETE ON TABLE public.community_profile_follows TO authenticated;
GRANT ALL ON TABLE public.community_profile_follows TO service_role;

ALTER TABLE public.community_profile_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community follows owner select" ON public.community_profile_follows;
CREATE POLICY "community follows owner select"
  ON public.community_profile_follows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = followed_id);

DROP POLICY IF EXISTS "community follows owner insert" ON public.community_profile_follows;
CREATE POLICY "community follows owner insert"
  ON public.community_profile_follows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND follower_id <> followed_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS profile
      WHERE profile.id = followed_id
        AND profile.profile_visibility = 'public'
        AND profile.username IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "community follows owner delete" ON public.community_profile_follows;
CREATE POLICY "community follows owner delete"
  ON public.community_profile_follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

DROP FUNCTION IF EXISTS public.get_public_profile_follow_stats(TEXT);
CREATE FUNCTION public.get_public_profile_follow_stats(p_username TEXT)
RETURNS TABLE (
  followers_count BIGINT,
  following_count BIGINT,
  followed_by_viewer BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.community_profile_follows AS follower WHERE follower.followed_id = profile.id),
    (SELECT count(*) FROM public.community_profile_follows AS following WHERE following.follower_id = profile.id),
    EXISTS (
      SELECT 1
      FROM public.community_profile_follows AS viewer_follow
      WHERE viewer_follow.follower_id = auth.uid()
        AND viewer_follow.followed_id = profile.id
    )
  FROM public.profiles AS profile
  WHERE profile.username = trim(p_username)
    AND profile.profile_visibility = 'public'
    AND profile.username IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile_follow_stats(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile_follow_stats(TEXT) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.toggle_public_profile_follow(TEXT, BOOLEAN);
CREATE FUNCTION public.toggle_public_profile_follow(
  p_username TEXT,
  p_follow BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_profile_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  SELECT profile.id
  INTO target_profile_id
  FROM public.profiles AS profile
  WHERE profile.username = trim(p_username)
    AND profile.profile_visibility = 'public'
    AND profile.username IS NOT NULL;

  IF target_profile_id IS NULL OR target_profile_id = auth.uid() THEN
    RETURN FALSE;
  END IF;

  IF p_follow THEN
    INSERT INTO public.community_profile_follows (follower_id, followed_id)
    VALUES (auth.uid(), target_profile_id)
    ON CONFLICT (follower_id, followed_id) DO NOTHING;
  ELSE
    DELETE FROM public.community_profile_follows
    WHERE follower_id = auth.uid()
      AND followed_id = target_profile_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_public_profile_follow(TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_public_profile_follow(TEXT, BOOLEAN) TO authenticated;
