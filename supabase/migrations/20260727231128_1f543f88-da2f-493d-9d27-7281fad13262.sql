-- ============================================================
-- Sistema de tarot
-- ============================================================

CREATE TABLE public.tarot_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_key text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  arcana text NOT NULL CHECK (arcana IN ('major', 'minor')),
  number integer,
  suit text CHECK (suit IN ('wands', 'cups', 'swords', 'pentacles')),
  rank text,
  summary text NOT NULL,
  upright_meaning text NOT NULL,
  reversed_meaning text,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  reflection_question text,
  yes_no_tendency text NOT NULL DEFAULT 'open' CHECK (yes_no_tendency IN ('favorable', 'caution', 'open')),
  image_key text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_demo boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tarot_cards_published_requires_date
    CHECK (status <> 'published' OR published_at IS NOT NULL),
  CONSTRAINT tarot_cards_major_arcana_number
    CHECK (arcana <> 'major' OR number IS NULL OR (number >= 0 AND number <= 21)),
  CONSTRAINT tarot_cards_minor_arcana_requires_suit
    CHECK (arcana <> 'minor' OR suit IS NOT NULL)
);

CREATE INDEX tarot_cards_status_order_idx ON public.tarot_cards (status, display_order);
CREATE INDEX tarot_cards_arcana_idx ON public.tarot_cards (arcana, status);
CREATE INDEX tarot_cards_slug_idx ON public.tarot_cards (slug);

-- Grants (Data API)
GRANT SELECT ON public.tarot_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarot_cards TO authenticated;
GRANT ALL ON public.tarot_cards TO service_role;

-- Trigger updated_at (reusa función existente public.set_updated_at)
CREATE TRIGGER tarot_cards_set_updated_at
  BEFORE UPDATE ON public.tarot_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.tarot_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarot public read published"
  ON public.tarot_cards
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "tarot editors read all"
  ON public.tarot_cards
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "tarot editors write"
  ON public.tarot_cards
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- ============================================================
-- Seed de demostración (8 Arcanos Mayores)
-- ============================================================
INSERT INTO public.tarot_cards
  (card_key, slug, name, arcana, number, summary, upright_meaning, keywords,
   reflection_question, yes_no_tendency, image_key, display_order, status,
   is_demo, published_at)
VALUES
  ('the_fool', 'el-loco', 'El Loco', 'major', 0,
   'El Loco simboliza el punto de partida: un momento en el que la libertad, la ligereza y la curiosidad pesan más que las certezas. Invita a mirar el camino con apertura, aceptando que aún no se conoce por completo.',
   'Sugiere el inicio de una etapa. Aparece cuando conviene atreverse a moverse sin exigirse tenerlo todo resuelto. Es un impulso hacia lo nuevo, pero acompañado de sensatez. Observa qué te llama, qué te suelta el cuerpo, qué se abre si dejas ir el control. No implica que el camino sea sencillo, sí que aún no está escrito.',
   '["comienzo","libertad","confianza","apertura"]'::jsonb,
   '¿Qué paso pequeño podría dar hoy si suelto un poco la exigencia de tenerlo claro?',
   'favorable', 'tarot_card_the_fool', 10, 'published', true, now()),

  ('the_magician', 'el-mago', 'El Mago', 'major', 1,
   'El Mago habla de recursos disponibles. Aparece cuando una intención puede empezar a tomar forma concreta si se combinan atención, voluntad y una acción sostenida.',
   'Indica que las herramientas necesarias ya están al alcance, aunque falte organizarlas. Es momento de traducir una idea en un gesto concreto: una conversación, un plan simple, un primer paso. También pide honestidad para reconocer qué se está usando y con qué intención. La energía es de comienzo activo, no de resultado inmediato.',
   '["voluntad","recursos","iniciativa"]'::jsonb,
   '¿Qué recurso ya tengo y aún no he puesto al servicio de lo que me importa?',
   'favorable', 'tarot_card_the_magician', 20, 'published', true, now()),

  ('the_high_priestess', 'la-sacerdotisa', 'La Sacerdotisa', 'major', 2,
   'La Sacerdotisa representa el saber interno que aún no tiene palabras. Es un llamado a hacer espacio al silencio antes de decidir, especialmente cuando la información externa no alcanza.',
   'Aparece cuando la respuesta útil no viene desde el análisis inmediato, sino desde una escucha más lenta. Sugiere pausar, dormir sobre el tema, escribir sin editar o simplemente esperar sin forzar. No invita a la inacción, sino a no confundir prisa con claridad.',
   '["intuición","silencio","paciencia"]'::jsonb,
   '¿Qué me está diciendo mi intuición cuando dejo de intentar tener la razón?',
   'open', 'tarot_card_the_high_priestess', 30, 'published', true, now()),

  ('the_empress', 'la-emperatriz', 'La Emperatriz', 'major', 3,
   'La Emperatriz habla de cuidado, creación y presencia. Señala un momento fértil para sostener aquello que ya vive: un vínculo, un proyecto, una parte de ti que pide atención amable.',
   'Sugiere generar condiciones para que algo crezca sin apuros: descanso suficiente, tiempo con quienes te nutren, gestos concretos de cuidado. También puede señalar la necesidad de revisar dónde estás dando demasiado y dónde te estás olvidando. Fertilidad simbólica, no promesa material.',
   '["cuidado","creatividad","presencia"]'::jsonb,
   '¿Qué necesita hoy más presencia y menos exigencia por mi parte?',
   'favorable', 'tarot_card_the_empress', 40, 'published', true, now()),

  ('the_lovers', 'los-enamorados', 'Los Enamorados', 'major', 6,
   'Los Enamorados representan la elección consciente. Aparece cuando conviene mirar de frente aquello que valoras y decidir desde ahí, no desde la costumbre ni desde la presión externa.',
   'Sugiere que hay una decisión importante en camino, no necesariamente amorosa. Puede tratarse de un vínculo, una prioridad, un modo de vivir. Invita a nombrar lo que realmente importa, ordenar los criterios y elegir con lucidez, sabiendo que toda elección deja algo fuera.',
   '["elección","valores","vínculo"]'::jsonb,
   '¿Qué elegiría hoy si estuviera atendiendo primero a lo que me importa?',
   'open', 'tarot_card_the_lovers', 60, 'published', true, now()),

  ('strength', 'la-fuerza', 'La Fuerza', 'major', 8,
   'La Fuerza sugiere sostener con firmeza y amabilidad. No habla de imponer, sino de acompañar aquello difícil sin desbordarse ni endurecerse.',
   'Indica un momento donde conviene regular la reacción antes que ganar la discusión. La fuerza real aparece en el pulso lento: respirar antes de responder, poner un límite sin agresión, seguir haciendo lo que corresponde aunque no haya aplauso. Es una energía de paciencia activa, no de sumisión.',
   '["paciencia","coraje","autocuidado"]'::jsonb,
   '¿En qué situación puedo hoy responder desde la calma en lugar de la reacción?',
   'favorable', 'tarot_card_strength', 80, 'published', true, now()),

  ('the_hermit', 'el-ermitano', 'El Ermitaño', 'major', 9,
   'El Ermitaño invita a un tiempo de pausa consciente para revisar de dónde vienes, dónde estás y qué necesitas. Es una energía de retiro breve, no de aislamiento permanente.',
   'Aparece cuando el ruido externo dificulta escuchar lo propio. Sugiere reducir estímulos, revisar decisiones con calma y consultar solo a quien realmente aporta claridad. También puede señalar que otras personas necesitan tu espacio de escucha, sin apurar respuestas ni imponer soluciones.',
   '["pausa","introspección","claridad"]'::jsonb,
   '¿Qué necesitaría escuchar mejor si bajara el volumen de lo externo?',
   'caution', 'tarot_card_the_hermit', 90, 'published', true, now()),

  ('the_star', 'la-estrella', 'La Estrella', 'major', 17,
   'La Estrella representa un respiro después de un tiempo difícil. Aparece cuando algo vuelve a ser posible, sin prometer que la recuperación será rápida ni completa.',
   'Sugiere que la esperanza puede volver a tener un lugar, sostenida por cuidado real y por pequeños actos concretos. Indica un tiempo para reparar vínculos, retomar prácticas de bienestar y volver a confiar con prudencia. No promete un giro milagroso, sí una dirección más amable.',
   '["esperanza","serenidad","recuperación"]'::jsonb,
   '¿Qué gesto pequeño puedo hacer hoy para cuidar mi esperanza?',
   'favorable', 'tarot_card_the_star', 170, 'published', true, now());