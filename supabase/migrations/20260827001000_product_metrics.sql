-- Fase 20: métricas agregadas de producto, sin datos individuales.

CREATE OR REPLACE FUNCTION public.admin_product_metrics()
RETURNS TABLE (
  metric_key TEXT,
  metric_value BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'registered_profiles'::TEXT, count(*)::BIGINT
  FROM public.profiles
  WHERE (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'public_profiles'::TEXT, count(*)::BIGINT
  FROM public.profiles
  WHERE profile_visibility = 'public'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'new_profiles_30d'::TEXT, count(*)::BIGINT
  FROM public.profiles
  WHERE created_at >= now() - interval '30 days'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'activity_events_30d'::TEXT, count(*)::BIGINT
  FROM public.user_activity_history
  WHERE created_at >= now() - interval '30 days'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'active_users_30d'::TEXT, count(DISTINCT user_id)::BIGINT
  FROM public.user_activity_history
  WHERE created_at >= now() - interval '30 days'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'reading_views_30d'::TEXT, count(*)::BIGINT
  FROM public.user_activity_history
  WHERE created_at >= now() - interval '30 days'
    AND activity_type IN ('view_horoscope', 'view_tarot_card', 'view_article', 'view_guide', 'tarot_reading')
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'published_posts'::TEXT, count(*)::BIGINT
  FROM public.community_posts
  WHERE visibility = 'public' AND status = 'published'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'community_posts_30d'::TEXT, count(*)::BIGINT
  FROM public.community_posts
  WHERE visibility = 'public'
    AND created_at >= now() - interval '30 days'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'open_reports'::TEXT, count(*)::BIGINT
  FROM public.community_post_reports
  WHERE status = 'open'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  UNION ALL
  SELECT 'newsletter_optins'::TEXT, count(*)::BIGINT
  FROM public.user_privacy_settings
  WHERE newsletter_opt_in = true
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
$$;

REVOKE ALL ON FUNCTION public.admin_product_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_product_metrics() TO authenticated;
