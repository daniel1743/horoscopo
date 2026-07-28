ALTER TABLE public.compatibility_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published compatibility profiles" ON public.compatibility_profiles;
CREATE POLICY "Public can read published compatibility profiles"
  ON public.compatibility_profiles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP TRIGGER IF EXISTS compatibility_profiles_set_updated_at ON public.compatibility_profiles;
CREATE TRIGGER compatibility_profiles_set_updated_at
  BEFORE UPDATE ON public.compatibility_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed de demostración (idempotente por pair_key)
INSERT INTO public.compatibility_profiles (
  pair_key, sign_a, sign_b, title, summary, dynamic_label, relationship_dynamic,
  dimensions, strengths, challenges, communication_tips, contexts,
  reflection_questions, misconceptions, disclaimer_key,
  status, is_demo, seo_title, seo_description, published_at
) VALUES
(
  'aries__libra', 'aries', 'libra',
  'Aries y Libra: impulso y equilibrio',
  'Un encuentro entre la iniciativa directa y la búsqueda de armonía. Cada uno puede aportar lo que al otro le cuesta sostener.',
  'Polaridad complementaria',
  'Aries suele actuar antes de deliberar y Libra suele deliberar antes de actuar. Cuando se escuchan, el ritmo del uno equilibra la duda del otro; cuando compiten, se acusan mutuamente de ser demasiado rápidos o demasiado lentos.',
  jsonb_build_object(
    'communication', jsonb_build_object('rating', 3, 'interpretation', 'Aries expresa impulsos directos, Libra matiza. Puede haber choques cuando la franqueza se percibe como brusquedad o la diplomacia como evasión.'),
    'emotional_rhythm', jsonb_build_object('rating', 3, 'interpretation', 'Aries se enciende rápido, Libra procesa desde el vínculo. Ambos pueden aprender a nombrar lo que sienten sin apresurar al otro.'),
    'daily_life', jsonb_build_object('rating', 3, 'interpretation', 'Aries prefiere decidir, Libra prefiere consultar. Distribuir tareas por afinidad ayuda a evitar tensiones sobre quién lidera.'),
    'attraction', jsonb_build_object('rating', 4, 'interpretation', 'La polaridad zodiacal genera curiosidad mutua. La diferencia de estilo se experimenta como atractivo simbólico.'),
    'conflict_management', jsonb_build_object('rating', 2, 'interpretation', 'Aries confronta, Libra evita. Pactar cómo abrir un desacuerdo sin dramatizarlo ni postergarlo es clave.'),
    'growth', jsonb_build_object('rating', 4, 'interpretation', 'Aries puede aprender pausas y Libra puede aprender a sostener incomodidad. La relación funciona como espejo.')
  ),
  jsonb_build_array(
    'Se complementan en decisiones grupales.',
    'Cada uno modela lo que al otro le falta.',
    'La curiosidad mutua sostiene el interés.'
  ),
  jsonb_build_array(
    'Impaciencia frente a indecisión.',
    'Discusiones que se postergan sin cerrarse.',
    'Choques por estilo de liderazgo.'
  ),
  jsonb_build_array(
    'Nombrar la intención antes de la acción.',
    'Acordar plazos para tomar decisiones.',
    'Evitar acusaciones sobre el estilo del otro.'
  ),
  jsonb_build_object(
    'romantic', 'Puede sentirse magnética. Requiere pactar espacios propios y decisiones compartidas.',
    'friendship', 'Aporta variedad: uno propone, otra revisa. La amistad florece cuando el ritmo se negocia.',
    'collaboration', 'Funcionan bien cuando dividen ejecución y diseño, y mal cuando compiten por dirigir.'
  ),
  jsonb_build_array(
    '¿Qué necesitamos acordar antes de decidir juntos?',
    '¿Cómo abrimos un desacuerdo sin postergarlo?'
  ),
  jsonb_build_array(
    'La polaridad no implica atracción inevitable.',
    'Ninguno debe abandonar su estilo para "encajar".'
  ),
  'compatibility_generic', 'published', true,
  'Aries y Libra: compatibilidad simbólica',
  'Explora la dinámica entre Aries y Libra: comunicación, ritmo emocional y áreas de crecimiento en una lectura editorial.',
  now()
),
(
  'cancer__capricornio', 'cancer', 'capricornio',
  'Cáncer y Capricornio: cuidado y estructura',
  'Dos formas de sostener: una desde el vínculo emocional, otra desde la organización. Pueden construir estabilidad si respetan sus ritmos.',
  'Polaridad complementaria',
  'Cáncer necesita sentir el vínculo y Capricornio necesita sentir el orden. Cuando se traducen, forman una base sólida; cuando se defienden, pueden distanciarse por percepciones de frialdad o exceso emocional.',
  jsonb_build_object(
    'communication', jsonb_build_object('rating', 3, 'interpretation', 'Cáncer habla desde el afecto, Capricornio desde la utilidad. Reconocer ambos códigos evita malentendidos.'),
    'emotional_rhythm', jsonb_build_object('rating', 4, 'interpretation', 'La calidez de Cáncer suaviza la disciplina de Capricornio, y su reserva puede contener la marea emocional.'),
    'daily_life', jsonb_build_object('rating', 5, 'interpretation', 'Ambos valoran la constancia. Los pactos cotidianos son un terreno cómodo.'),
    'attraction', jsonb_build_object('rating', 3, 'interpretation', 'La atracción se construye con tiempo. Cada uno reconoce en el otro cualidades que le faltan.'),
    'conflict_management', jsonb_build_object('rating', 3, 'interpretation', 'Cáncer se retrae, Capricornio se enfría. Acordar cómo retomar la conversación evita silencios largos.'),
    'growth', jsonb_build_object('rating', 4, 'interpretation', 'Aprenden a integrar necesidad y estructura. Es una relación que suele fortalecer con los años.')
  ),
  jsonb_build_array(
    'Compromiso y continuidad.',
    'Complementariedad entre afecto y orden.',
    'Objetivos a largo plazo compartidos.'
  ),
  jsonb_build_array(
    'Silencios prolongados tras desacuerdos.',
    'Interpretar frialdad donde hay cautela.',
    'Priorizar deber sobre necesidad emocional.'
  ),
  jsonb_build_array(
    'Preguntar antes de asumir el estado emocional.',
    'Reconocer explícitamente el apoyo del otro.',
    'Acordar rituales de reconexión.'
  ),
  jsonb_build_object(
    'romantic', 'Puede sentirse profundamente estable. Requiere expresar lo que se siente sin esperar que se adivine.',
    'friendship', 'Amistad discreta y leal. Se sostiene con presencia práctica.',
    'collaboration', 'Excelente para proyectos de largo aliento con roles claros.'
  ),
  jsonb_build_array(
    '¿Cómo pedimos apoyo emocional sin sentirnos vulnerables?',
    '¿Qué señales indican que necesitamos reconectar?'
  ),
  jsonb_build_array(
    'La estabilidad no equivale a ausencia de conflictos.',
    'Nadie tiene que renunciar a su modo para "cuidar" al otro.'
  ),
  'compatibility_generic', 'published', true,
  'Cáncer y Capricornio: compatibilidad simbólica',
  'Lectura editorial de la dinámica entre Cáncer y Capricornio: cuidado emocional, estructura y crecimiento.',
  now()
),
(
  'geminis__sagitario', 'geminis', 'sagitario',
  'Géminis y Sagitario: curiosidad y horizonte',
  'Dos formas de explorar el mundo: una desde las conexiones cercanas y otra desde los grandes trayectos. La conversación es el terreno común.',
  'Polaridad complementaria',
  'Géminis observa detalles y Sagitario busca sentidos amplios. Juntos construyen un diálogo dinámico; separados, pueden acusarse de dispersión o de idealismo abstracto.',
  jsonb_build_object(
    'communication', jsonb_build_object('rating', 5, 'interpretation', 'La palabra es el vínculo natural. Fluidez alta si se respetan pausas.'),
    'emotional_rhythm', jsonb_build_object('rating', 3, 'interpretation', 'Ambos evitan quedarse en la incomodidad emocional. Es útil pactar espacios de calma.'),
    'daily_life', jsonb_build_object('rating', 3, 'interpretation', 'Planes que cambian con frecuencia. Puede faltar rutina compartida.'),
    'attraction', jsonb_build_object('rating', 4, 'interpretation', 'La estimulación mental sostiene el interés. La curiosidad es el motor.'),
    'conflict_management', jsonb_build_object('rating', 3, 'interpretation', 'Tendencia a esquivar temas densos con humor. Nombrarlos evita acumulaciones.'),
    'growth', jsonb_build_object('rating', 4, 'interpretation', 'Aprenden a integrar detalle y visión, cercanía y aventura.')
  ),
  jsonb_build_array(
    'Diálogo constante y variado.',
    'Apertura al cambio y a nuevas ideas.',
    'Curiosidad como base del vínculo.'
  ),
  jsonb_build_array(
    'Falta de continuidad en los planes.',
    'Evitación de temas emocionales densos.',
    'Sensación de superficialidad si no se profundiza.'
  ),
  jsonb_build_array(
    'Programar conversaciones sobre temas importantes.',
    'Sostener promesas cotidianas concretas.',
    'Nombrar sentimientos aun cuando incomoden.'
  ),
  jsonb_build_object(
    'romantic', 'Alegre y expansiva. Requiere trabajar sostenimiento y compromisos concretos.',
    'friendship', 'Amistad estimulante, con muchas ideas y proyectos compartidos.',
    'collaboration', 'Muy creativa; conviene incorporar disciplina para cerrar.'
  ),
  jsonb_build_array(
    '¿Qué compromisos concretos queremos sostener?',
    '¿Cómo manejamos los temas incómodos sin evadirlos?'
  ),
  jsonb_build_array(
    'La libertad no equivale a falta de compromiso.',
    'Ser curiosos no significa ser superficiales.'
  ),
  'compatibility_generic', 'published', true,
  'Géminis y Sagitario: compatibilidad simbólica',
  'Lectura editorial de la dinámica entre Géminis y Sagitario: comunicación, ritmo emocional y áreas de crecimiento.',
  now()
)
ON CONFLICT (pair_key) DO NOTHING;