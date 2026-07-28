
-- AI assistant tables

CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  module text NOT NULL DEFAULT 'general' CHECK (module IN ('general','tarot','horoscope','article','recommendation','reflection')),
  summary text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_conversations_user_updated_idx ON public.ai_conversations(user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_own_select" ON public.ai_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "conv_own_insert" ON public.ai_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conv_own_update" ON public.ai_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conv_own_delete" ON public.ai_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER ai_conversations_set_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL CHECK (char_length(content) <= 20000),
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_alias text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_messages_conv_idx ON public.ai_messages(conversation_id, created_at);
CREATE INDEX ai_messages_user_idx ON public.ai_messages(user_id);
GRANT SELECT, INSERT, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_own_select" ON public.ai_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "msg_own_insert" ON public.ai_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "msg_own_delete" ON public.ai_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ai_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('preference','interest','goal','personal_context','content_preference')),
  memory_key text NOT NULL,
  memory_value jsonb NOT NULL,
  summary text NOT NULL,
  source_conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  consent_status text NOT NULL DEFAULT 'confirmed' CHECK (consent_status IN ('confirmed','revoked')),
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_memories_user_idx ON public.ai_memories(user_id, active);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_memories TO authenticated;
GRANT ALL ON public.ai_memories TO service_role;
ALTER TABLE public.ai_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mem_own_select" ON public.ai_memories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "mem_own_insert" ON public.ai_memories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mem_own_update" ON public.ai_memories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mem_own_delete" ON public.ai_memories FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER ai_memories_set_updated_at BEFORE UPDATE ON public.ai_memories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ai_user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  response_length text NOT NULL DEFAULT 'balanced' CHECK (response_length IN ('brief','balanced','detailed')),
  tone text NOT NULL DEFAULT 'warm' CHECK (tone IN ('warm','direct','reflective')),
  memory_enabled boolean NOT NULL DEFAULT true,
  citations_expanded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_user_preferences TO authenticated;
GRANT ALL ON public.ai_user_preferences TO service_role;
ALTER TABLE public.ai_user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pref_own_select" ON public.ai_user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pref_own_insert" ON public.ai_user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pref_own_update" ON public.ai_user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER ai_user_preferences_set_updated_at BEFORE UPDATE ON public.ai_user_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.ai_messages(id) ON DELETE SET NULL,
  rating text NOT NULL CHECK (rating IN ('helpful','not_helpful')),
  module text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_feedback TO authenticated;
GRANT ALL ON public.ai_feedback TO service_role;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fb_own_select" ON public.ai_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fb_own_insert" ON public.ai_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fb_own_update" ON public.ai_feedback FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Server-only usage counters (no anon/authenticated access)
CREATE TABLE public.ai_usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_key_hash text,
  usage_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  requests integer NOT NULL DEFAULT 0,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_micros bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((user_id IS NOT NULL) OR (anonymous_key_hash IS NOT NULL))
);
CREATE UNIQUE INDEX ai_usage_user_day_idx ON public.ai_usage_daily(user_id, usage_date) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX ai_usage_anon_day_idx ON public.ai_usage_daily(anonymous_key_hash, usage_date) WHERE anonymous_key_hash IS NOT NULL;
GRANT ALL ON public.ai_usage_daily TO service_role;
ALTER TABLE public.ai_usage_daily ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: server-only.
