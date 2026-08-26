-- Fase 14: likes y republicaciones reversibles.
-- Cada usuario solo puede reaccionar una vez por publicación.

CREATE TABLE IF NOT EXISTS public.community_post_likes (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_post_likes_post_idx
  ON public.community_post_likes (post_id);

GRANT SELECT, INSERT, DELETE ON public.community_post_likes TO authenticated;
GRANT ALL ON public.community_post_likes TO service_role;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community likes own select" ON public.community_post_likes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "community likes own insert" ON public.community_post_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community likes own delete" ON public.community_post_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_post_reposts (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_post_reposts_feed_idx
  ON public.community_post_reposts (created_at DESC);
CREATE INDEX IF NOT EXISTS community_post_reposts_user_idx
  ON public.community_post_reposts (user_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.community_post_reposts TO authenticated;
GRANT ALL ON public.community_post_reposts TO service_role;
ALTER TABLE public.community_post_reposts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "community reposts own select" ON public.community_post_reposts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "community reposts own insert" ON public.community_post_reposts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community reposts own delete" ON public.community_post_reposts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP FUNCTION IF EXISTS public.list_public_community_posts(INTEGER);
CREATE OR REPLACE FUNCTION public.list_public_community_posts(p_limit INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  post_type TEXT,
  title TEXT,
  body TEXT,
  source_ref TEXT,
  source_title TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  author_aura_style TEXT,
  likes_count BIGINT,
  reposts_count BIGINT,
  liked_by_viewer BOOLEAN,
  reposted_by_viewer BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    post.id,
    post.post_type,
    post.title,
    post.body,
    post.source_ref,
    post.source_title,
    post.source_url,
    post.created_at,
    profile.username,
    profile.display_name,
    profile.avatar_url,
    profile.aura_style,
    (SELECT count(*) FROM public.community_post_likes AS like_row WHERE like_row.post_id = post.id),
    (SELECT count(*) FROM public.community_post_reposts AS repost_row WHERE repost_row.post_id = post.id),
    EXISTS (
      SELECT 1 FROM public.community_post_likes AS like_row
      WHERE like_row.post_id = post.id AND like_row.user_id = auth.uid()
    ),
    EXISTS (
      SELECT 1 FROM public.community_post_reposts AS repost_row
      WHERE repost_row.post_id = post.id AND repost_row.user_id = auth.uid()
    )
  FROM public.community_posts AS post
  INNER JOIN public.profiles AS profile ON profile.id = post.user_id
  WHERE post.visibility = 'public'
    AND post.status = 'published'
    AND profile.profile_visibility = 'public'
    AND profile.username IS NOT NULL
  ORDER BY post.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50);
$$;

REVOKE ALL ON FUNCTION public.list_public_community_posts(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_community_posts(INTEGER) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.list_public_community_reposts(p_limit INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  post_type TEXT,
  title TEXT,
  body TEXT,
  source_ref TEXT,
  source_title TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  author_aura_style TEXT,
  likes_count BIGINT,
  reposts_count BIGINT,
  liked_by_viewer BOOLEAN,
  reposted_by_viewer BOOLEAN,
  reposter_username TEXT,
  reposter_display_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    post.id,
    post.post_type,
    post.title,
    post.body,
    post.source_ref,
    post.source_title,
    post.source_url,
    repost.created_at,
    original_profile.username,
    original_profile.display_name,
    original_profile.avatar_url,
    original_profile.aura_style,
    (SELECT count(*) FROM public.community_post_likes AS like_row WHERE like_row.post_id = post.id),
    (SELECT count(*) FROM public.community_post_reposts AS repost_row WHERE repost_row.post_id = post.id),
    EXISTS (
      SELECT 1 FROM public.community_post_likes AS like_row
      WHERE like_row.post_id = post.id AND like_row.user_id = auth.uid()
    ),
    EXISTS (
      SELECT 1 FROM public.community_post_reposts AS repost_row
      WHERE repost_row.post_id = post.id AND repost_row.user_id = auth.uid()
    ),
    reposter_profile.username,
    reposter_profile.display_name
  FROM public.community_post_reposts AS repost
  INNER JOIN public.community_posts AS post ON post.id = repost.post_id
  INNER JOIN public.profiles AS original_profile ON original_profile.id = post.user_id
  INNER JOIN public.profiles AS reposter_profile ON reposter_profile.id = repost.user_id
  WHERE post.visibility = 'public'
    AND post.status = 'published'
    AND original_profile.profile_visibility = 'public'
    AND original_profile.username IS NOT NULL
    AND reposter_profile.profile_visibility = 'public'
    AND reposter_profile.username IS NOT NULL
  ORDER BY repost.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50);
$$;

REVOKE ALL ON FUNCTION public.list_public_community_reposts(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_community_reposts(INTEGER) TO anon, authenticated;
