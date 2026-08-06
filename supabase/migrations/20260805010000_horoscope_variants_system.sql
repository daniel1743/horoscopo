-- =====================================================================
-- Migration: Sistema de variantes de horóscopos con generación automática
-- Fecha: 2026-08-05
-- Descripción: Extiende el sistema de horóscopos para soportar múltiples
--              variantes (4 por signo/período) y asignación personalizada
--              para usuarios autenticados y visitantes.
-- =====================================================================

-- =====================================================================
-- 1. Extender tabla horoscopes con soporte de variantes
-- =====================================================================

-- Agregar columna variant_id (1-4) y metadata de generación
ALTER TABLE public.horoscopes
  ADD COLUMN IF NOT EXISTS variant_id SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}'::jsonb;

-- Agregar constraint para variant_id
ALTER TABLE public.horoscopes
  DROP CONSTRAINT IF EXISTS horoscopes_variant_id_check,
  ADD CONSTRAINT horoscopes_variant_id_check
    CHECK (variant_id BETWEEN 1 AND 4);

-- Actualizar constraint único para incluir variantes
-- Ahora cada signo/período/fecha puede tener 4 variantes diferentes
ALTER TABLE public.horoscopes
  DROP CONSTRAINT IF EXISTS horoscopes_sign_period_date_unique,
  ADD CONSTRAINT horoscopes_sign_period_date_variant_unique
    UNIQUE (sign_slug, period, date_for, variant_id);

-- Índice para consultas rápidas por variante específica
CREATE INDEX IF NOT EXISTS horoscopes_sign_period_date_variant_idx
  ON public.horoscopes (sign_slug, period, date_for, variant_id);

-- Índice para consultas de todas las variantes de un signo/período/fecha
CREATE INDEX IF NOT EXISTS horoscopes_date_period_idx
  ON public.horoscopes (date_for DESC, period);

-- Comentarios para documentación
COMMENT ON COLUMN public.horoscopes.variant_id IS
  'ID de variante (1-4). Permite 4 versiones diferentes del mismo horóscopo para personalización.';

COMMENT ON COLUMN public.horoscopes.generation_metadata IS
  'Metadata de generación: modelo IA usado, tokens consumidos, intentos, etc.';

-- =====================================================================
-- 2. Tabla de asignaciones de variantes para usuarios autenticados
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_horoscope_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sign_slug TEXT NOT NULL,
  period public.horoscope_period NOT NULL,
  date_for DATE NOT NULL,
  variant_id SMALLINT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint: un usuario solo puede tener una variante por signo/período/fecha
  CONSTRAINT user_horoscope_assignments_unique
    UNIQUE (user_id, sign_slug, period, date_for),

  -- Constraint: variant_id válido
  CONSTRAINT user_horoscope_assignments_variant_check
    CHECK (variant_id BETWEEN 1 AND 4)
);

-- Índices para performance
CREATE INDEX user_horoscope_assignments_user_idx
  ON public.user_horoscope_assignments (user_id, date_for DESC);

CREATE INDEX user_horoscope_assignments_date_idx
  ON public.user_horoscope_assignments (date_for DESC, period);

-- Grants
GRANT SELECT, INSERT ON public.user_horoscope_assignments TO authenticated;
GRANT ALL ON public.user_horoscope_assignments TO service_role;

-- Row Level Security
ALTER TABLE public.user_horoscope_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios autenticados solo pueden leer sus propias asignaciones
DROP POLICY IF EXISTS "users read own assignments" ON public.user_horoscope_assignments;
CREATE POLICY "users read own assignments"
  ON public.user_horoscope_assignments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: usuarios autenticados solo pueden insertar sus propias asignaciones
DROP POLICY IF EXISTS "users insert own assignments" ON public.user_horoscope_assignments;
CREATE POLICY "users insert own assignments"
  ON public.user_horoscope_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: service_role puede leer/escribir todo (para cron jobs)
DROP POLICY IF EXISTS "service role full access" ON public.user_horoscope_assignments;
CREATE POLICY "service role full access"
  ON public.user_horoscope_assignments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.user_horoscope_assignments IS
  'Guarda qué variante de horóscopo se asignó a cada usuario autenticado. Garantiza consistencia: el mismo usuario siempre ve la misma variante para un día dado.';

-- =====================================================================
-- 3. Tabla de logs de generación batch
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.horoscope_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL,
  period public.horoscope_period NOT NULL,
  date_for DATE NOT NULL,
  signs_requested SMALLINT NOT NULL DEFAULT 12,
  variants_per_sign SMALLINT NOT NULL DEFAULT 4,
  total_requested SMALLINT NOT NULL,
  total_generated SMALLINT NOT NULL DEFAULT 0,
  total_failed SMALLINT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  error_details JSONB,
  generation_stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint: status válido
  CONSTRAINT horoscope_generation_logs_status_check
    CHECK (status IN ('running', 'completed', 'partial', 'failed', 'cancelled'))
);

-- Índices
CREATE INDEX horoscope_generation_logs_date_idx
  ON public.horoscope_generation_logs (date_for DESC, created_at DESC);

CREATE INDEX horoscope_generation_logs_batch_idx
  ON public.horoscope_generation_logs (batch_id);

CREATE INDEX horoscope_generation_logs_status_idx
  ON public.horoscope_generation_logs (status, created_at DESC);

-- Grants
GRANT SELECT ON public.horoscope_generation_logs TO authenticated;
GRANT ALL ON public.horoscope_generation_logs TO service_role;

-- Row Level Security
ALTER TABLE public.horoscope_generation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios con rol admin/editor pueden ver logs
DROP POLICY IF EXISTS "editors read logs" ON public.horoscope_generation_logs;
CREATE POLICY "editors read logs"
  ON public.horoscope_generation_logs
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'editor'::app_role)
  );

-- Policy: service_role puede escribir logs (cron jobs)
DROP POLICY IF EXISTS "service role write logs" ON public.horoscope_generation_logs;
CREATE POLICY "service role write logs"
  ON public.horoscope_generation_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.horoscope_generation_logs IS
  'Logs de ejecución de generación batch de horóscopos. Permite monitorear éxito, fallos, y performance del sistema automatizado.';

COMMENT ON COLUMN public.horoscope_generation_logs.batch_id IS
  'ID único del batch (ej: "daily-2026-08-05-01:00")';

COMMENT ON COLUMN public.horoscope_generation_logs.generation_stats IS
  'Estadísticas de generación: tokens consumidos, tiempo promedio, calidad promedio, etc.';

-- =====================================================================
-- 4. Función helper: obtener o crear asignación de variante
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_or_assign_variant(
  p_user_id UUID,
  p_sign_slug TEXT,
  p_period public.horoscope_period,
  p_date_for DATE
)
RETURNS SMALLINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_variant_id SMALLINT;
  v_hash BIGINT;
BEGIN
  -- Intentar obtener asignación existente
  SELECT variant_id INTO v_variant_id
  FROM public.user_horoscope_assignments
  WHERE user_id = p_user_id
    AND sign_slug = p_sign_slug
    AND period = p_period
    AND date_for = p_date_for;

  -- Si ya existe, devolverla
  IF FOUND THEN
    RETURN v_variant_id;
  END IF;

  -- Si no existe, calcular hash consistente y asignar variante (1-4)
  -- Usa user_id + sign + date para que sea determinístico pero distribuido
  v_hash := ABS(('x' || MD5(
    p_user_id::TEXT ||
    p_sign_slug ||
    p_date_for::TEXT
  ))::BIT(32)::BIGINT);

  v_variant_id := (v_hash % 4) + 1;

  -- Insertar nueva asignación
  INSERT INTO public.user_horoscope_assignments
    (user_id, sign_slug, period, date_for, variant_id)
  VALUES
    (p_user_id, p_sign_slug, p_period, p_date_for, v_variant_id)
  ON CONFLICT (user_id, sign_slug, period, date_for)
  DO NOTHING;

  RETURN v_variant_id;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, devolver variante 1 (fallback seguro)
    RETURN 1;
END;
$$;

-- Grants para la función
REVOKE ALL ON FUNCTION public.get_or_assign_variant FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_assign_variant TO authenticated, service_role;

-- Comentario
COMMENT ON FUNCTION public.get_or_assign_variant IS
  'Obtiene la variante asignada a un usuario para un horóscopo específico. Si no existe, la asigna usando hash consistente (1-4) y la guarda en la BD.';

-- =====================================================================
-- 5. Vista para facilitar queries de horóscopos con variantes
-- =====================================================================

CREATE OR REPLACE VIEW public.horoscopes_with_assignments AS
SELECT
  h.*,
  uha.user_id AS assigned_user_id,
  uha.assigned_at
FROM public.horoscopes h
LEFT JOIN public.user_horoscope_assignments uha
  ON h.sign_slug = uha.sign_slug
  AND h.period = uha.period
  AND h.date_for = uha.date_for
  AND h.variant_id = uha.variant_id
WHERE h.published_at IS NOT NULL
  AND h.published_at <= now();

GRANT SELECT ON public.horoscopes_with_assignments TO anon, authenticated;

COMMENT ON VIEW public.horoscopes_with_assignments IS
  'Vista que combina horóscopos publicados con sus asignaciones de usuario. Útil para queries de dashboard y analytics.';

-- =====================================================================
-- 6. Índices adicionales para performance en queries comunes
-- =====================================================================

-- Para queries tipo "dame todas las variantes de un período/fecha"
CREATE INDEX IF NOT EXISTS horoscopes_period_date_published_idx
  ON public.horoscopes (period, date_for, published_at)
  WHERE published_at IS NOT NULL;

-- Para queries de generación (verificar si ya existe)
CREATE INDEX IF NOT EXISTS horoscopes_date_variant_unpublished_idx
  ON public.horoscopes (date_for, variant_id)
  WHERE published_at IS NULL;

-- =====================================================================
-- 7. Trigger para actualizar estadísticas en generation_logs
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_generation_log_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Cuando se completa un log, actualizar contadores finales
  IF NEW.status IN ('completed', 'partial', 'failed') AND OLD.status = 'running' THEN
    NEW.completed_at := now();

    -- Calcular estadísticas básicas si no están ya
    IF NEW.generation_stats IS NULL OR NEW.generation_stats = '{}'::jsonb THEN
      NEW.generation_stats := jsonb_build_object(
        'duration_seconds', EXTRACT(EPOCH FROM (now() - NEW.started_at)),
        'success_rate',
          CASE
            WHEN NEW.total_requested > 0
            THEN ROUND((NEW.total_generated::NUMERIC / NEW.total_requested::NUMERIC) * 100, 2)
            ELSE 0
          END
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_generation_log_stats ON public.horoscope_generation_logs;
CREATE TRIGGER trigger_update_generation_log_stats
  BEFORE UPDATE ON public.horoscope_generation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_generation_log_stats();

-- =====================================================================
-- 8. Datos de prueba (opcional, comentar en producción)
-- =====================================================================

-- Descomentar para insertar datos de prueba
/*
-- Insertar 2 variantes de horóscopo de prueba
INSERT INTO public.horoscopes
  (sign_slug, period, date_for, variant_id, summary, focus, mood, energy, is_demo, published_at)
VALUES
  ('aries', 'daily', CURRENT_DATE, 1,
   'Hoy Marte en trígono con Júpiter amplifica tu energía emprendedora.',
   'Acción', 'Decidido', 4, true, now()),
  ('aries', 'daily', CURRENT_DATE, 2,
   'La Luna en Capricornio te invita a estructurar tus emociones con pragmatismo.',
   'Estabilidad emocional', 'Reflexivo', 3, true, now());
*/

-- =====================================================================
-- Fin de migration
-- =====================================================================

-- Mostrar resumen de cambios
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completada: Sistema de variantes de horóscopos';
  RAISE NOTICE '📊 Tablas creadas/modificadas:';
  RAISE NOTICE '   - horoscopes (extendida con variant_id)';
  RAISE NOTICE '   - user_horoscope_assignments (nueva)';
  RAISE NOTICE '   - horoscope_generation_logs (nueva)';
  RAISE NOTICE '🔧 Funciones creadas:';
  RAISE NOTICE '   - get_or_assign_variant()';
  RAISE NOTICE '📈 Vista creada:';
  RAISE NOTICE '   - horoscopes_with_assignments';
  RAISE NOTICE '🔒 RLS policies configuradas para todas las tablas';
END $$;
