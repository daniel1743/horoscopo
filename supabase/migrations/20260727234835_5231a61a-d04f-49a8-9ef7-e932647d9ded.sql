-- ============================================================================
-- YAML 10 · Sistema lunar (contenido editorial + caché de cálculos)
-- ============================================================================

-- 1) Contenido editorial por fase ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.moon_phase_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_key TEXT NOT NULL UNIQUE
    CHECK (phase_key IN (
      'new_moon','waxing_crescent','first_quarter','waxing_gibbous',
      'full_moon','waning_gibbous','last_quarter','waning_crescent'
    )),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  meaning TEXT NOT NULL,
  reflection_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  practical_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  misconceptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  disclaimer_key TEXT NOT NULL DEFAULT 'general',
  image_key TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.moon_phase_content TO anon, authenticated;
GRANT ALL ON public.moon_phase_content TO service_role;

ALTER TABLE public.moon_phase_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "moon_content public read published"
  ON public.moon_phase_content
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "moon_content editors read all"
  ON public.moon_phase_content
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "moon_content editors write"
  ON public.moon_phase_content
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER moon_phase_content_set_updated_at
  BEFORE UPDATE ON public.moon_phase_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Caché de cálculos astronómicos (server-only) ----------------------------
CREATE TABLE IF NOT EXISTS public.moon_calculation_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  calculation_type TEXT NOT NULL
    CHECK (calculation_type IN ('daily_snapshot','monthly_calendar','phase_events')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  timezone TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  result JSONB NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS moon_calculation_cache_expires_at_idx
  ON public.moon_calculation_cache (expires_at);
CREATE INDEX IF NOT EXISTS moon_calculation_cache_type_period_idx
  ON public.moon_calculation_cache (calculation_type, period_start, period_end);

GRANT ALL ON public.moon_calculation_cache TO service_role;
-- Sin GRANT a anon/authenticated: la caché es exclusivamente server-only.

ALTER TABLE public.moon_calculation_cache ENABLE ROW LEVEL SECURITY;
-- Sin políticas: RLS bloquea todo acceso salvo service_role.

-- 3) Seed editorial (demo) ---------------------------------------------------
INSERT INTO public.moon_phase_content
  (phase_key, title, summary, meaning, reflection_questions, practical_suggestions,
   misconceptions, image_key, seo_title, seo_description, status, is_demo, published_at)
VALUES
  ('new_moon',
   'Luna nueva',
   'La Luna nueva marca el inicio del ciclo lunar visible: la cara iluminada mira al Sol y desde la Tierra no vemos disco.',
   'Simbólicamente muchas tradiciones asocian la Luna nueva con comienzos, intenciones y pausas breves antes de un nuevo movimiento. Es una lectura cultural, no una descripción de efectos físicos.',
   '["¿Qué te gustaría comenzar en las próximas semanas?", "¿Qué hábito o proyecto podría beneficiarse de un reinicio consciente?", "¿Qué necesitas soltar antes de sembrar algo nuevo?"]',
   '["Escribe una intención breve y realista.", "Ordena un espacio pequeño de tu casa o de tu día.", "Reserva un momento de silencio antes de decidir."]',
   '["La Luna nueva no significa que la Luna \"desaparezca\": simplemente no vemos su cara iluminada."]',
   'moon_phase_new',
   'Luna nueva | Significado, ciclo y reflexión',
   'Descubre qué es la Luna nueva desde el punto de vista astronómico y qué lectura simbólica se le suele asociar.',
   'published', true, now()),

  ('waxing_crescent',
   'Luna creciente',
   'La Luna creciente aparece como una fina hoz iluminada tras la Luna nueva. La iluminación aumenta día a día.',
   'Muchas culturas asocian esta fase con el impulso inicial: probar, avanzar con cuidado. Es un marco simbólico, no un efecto sobre las personas.',
   '["¿Qué paso pequeño puedes dar hoy?", "¿Qué apoyo necesitas para sostener lo que empezaste?"]',
   '["Divide una meta grande en un paso concreto y visible.", "Comparte tu intención con alguien de confianza."]',
   '["\"Ver la Luna creciente por primera vez\" no cambia el resultado de decisiones futuras."]',
   'moon_phase_waxing_crescent',
   'Luna creciente | Significado y ciclo',
   'Astronomía y lectura simbólica de la Luna creciente en el ciclo sinódico.',
   'published', true, now()),

  ('first_quarter',
   'Cuarto creciente',
   'En el cuarto creciente vemos iluminada la mitad del disco lunar. Es el segundo cuarto del ciclo sinódico.',
   'Simbólicamente se asocia a decisiones intermedias y ajustes. Es una lectura cultural, no una prescripción.',
   '["¿Qué ajuste te ayudaría a continuar sin forzar?", "¿Qué necesita más claridad para avanzar?"]',
   '["Revisa una tarea pendiente y decide si continúa, se pausa o se descarta.", "Practica una conversación difícil con calma."]',
   '["La mitad iluminada visible no implica \"la mitad del camino\" en tus proyectos."]',
   'moon_phase_first_quarter',
   'Cuarto creciente | Significado y ciclo',
   'Descripción astronómica del cuarto creciente y su lectura simbólica clásica.',
   'published', true, now()),

  ('waxing_gibbous',
   'Gibosa creciente',
   'Más de la mitad del disco visible está iluminado y la iluminación sigue aumentando hasta la Luna llena.',
   'Suele leerse simbólicamente como una fase de refinamiento, sin efectos causales demostrables sobre las personas.',
   '["¿Qué necesita más pulido antes de mostrarse?", "¿Qué detalle marcaría la diferencia si lo cuidas hoy?"]',
   '["Revisa un texto, un plan o un proyecto con calma.", "Reserva un espacio para practicar."]',
   '["No hay evidencia científica de que la fase gibosa cambie el ánimo colectivo."]',
   'moon_phase_waxing_gibbous',
   'Gibosa creciente | Significado y ciclo',
   'Qué es la gibosa creciente y cómo se interpreta simbólicamente.',
   'published', true, now()),

  ('full_moon',
   'Luna llena',
   'En la Luna llena vemos la cara completamente iluminada porque la Tierra se sitúa entre el Sol y la Luna.',
   'Muchas tradiciones asocian la Luna llena con culminación y visibilidad. Es una lectura cultural; no describe efectos comprobados sobre el comportamiento humano.',
   '["¿Qué resultado quieres reconocer?", "¿Qué puedes agradecer del ciclo que se cierra?"]',
   '["Escribe una nota de cierre para algo que termina.", "Comparte un logro pequeño con alguien cercano."]',
   '["Los estudios científicos no encuentran efectos sistemáticos de la Luna llena sobre el sueño o el ánimo."]',
   'moon_phase_full',
   'Luna llena | Significado, ciclo y cultura',
   'La Luna llena en astronomía y en las principales lecturas simbólicas contemporáneas.',
   'published', true, now()),

  ('waning_gibbous',
   'Gibosa menguante',
   'Tras la Luna llena la iluminación disminuye. La gibosa menguante conserva más de la mitad del disco visible iluminado.',
   'Se lee simbólicamente como una fase de integración y agradecimiento. Es una interpretación cultural.',
   '["¿Qué aprendiste esta vuelta del ciclo?", "¿Qué merece la pena conservar?"]',
   '["Ordena notas o ideas recientes.", "Descansa deliberadamente."]',
   '["La disminución de iluminación no \"drena\" la energía de las personas."]',
   'moon_phase_waning_gibbous',
   'Gibosa menguante | Significado y ciclo',
   'La gibosa menguante en el ciclo sinódico y su lectura simbólica.',
   'published', true, now()),

  ('last_quarter',
   'Cuarto menguante',
   'En el cuarto menguante vemos iluminada la mitad opuesta al cuarto creciente. Marca el tercer cuarto del ciclo.',
   'Suele leerse como una invitación simbólica a soltar. No hay evidencia de efectos causales.',
   '["¿Qué puedes soltar con amabilidad?", "¿Qué costumbre te está pesando más que ayudándote?"]',
   '["Elimina algo digital o físico que ya no usas.", "Revisa acuerdos o suscripciones."]',
   '["Cortar el cabello o firmar contratos en esta fase no tiene efectos demostrados."]',
   'moon_phase_last_quarter',
   'Cuarto menguante | Significado y ciclo',
   'Astronomía y simbología del cuarto menguante en el ciclo lunar.',
   'published', true, now()),

  ('waning_crescent',
   'Luna menguante',
   'La fina hoz menguante precede a la próxima Luna nueva. La iluminación es baja y sigue disminuyendo.',
   'Simbólicamente se asocia a descanso, cierre y preparación de un nuevo ciclo, sin efectos físicos comprobados.',
   '["¿Qué necesitas descansar de verdad?", "¿Qué quieres tener claro antes del próximo comienzo?"]',
   '["Reduce estímulos por la noche.", "Prepara materialmente lo que empezarás en la próxima Luna nueva."]',
   '["La Luna menguante no provoca fatiga por sí misma; el cansancio tiene causas fisiológicas y contextuales."]',
   'moon_phase_waning_crescent',
   'Luna menguante | Significado y ciclo',
   'La Luna menguante y su lectura simbólica antes de un nuevo ciclo.',
   'published', true, now())
ON CONFLICT (phase_key) DO NOTHING;