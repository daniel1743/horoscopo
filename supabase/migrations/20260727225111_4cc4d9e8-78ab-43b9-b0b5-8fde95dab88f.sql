
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.editorial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.editorial_categories TO anon, authenticated;
GRANT ALL ON public.editorial_categories TO service_role;
ALTER TABLE public.editorial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.editorial_categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.editorial_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_editorial_categories_updated BEFORE UPDATE ON public.editorial_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.editorial_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role_label TEXT,
  bio TEXT,
  avatar_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.editorial_authors TO anon, authenticated;
GRANT ALL ON public.editorial_authors TO service_role;
ALTER TABLE public.editorial_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authors public read" ON public.editorial_authors FOR SELECT USING (true);
CREATE POLICY "authors admin write" ON public.editorial_authors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_editorial_authors_updated BEFORE UPDATE ON public.editorial_authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.editorial_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE public.editorial_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.editorial_categories(id) ON DELETE RESTRICT,
  author_id UUID NOT NULL REFERENCES public.editorial_authors(id) ON DELETE RESTRICT,
  status public.editorial_status NOT NULL DEFAULT 'draft',
  image_url TEXT,
  image_alt TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  reading_time INTEGER,
  featured BOOLEAN NOT NULL DEFAULT false,
  home_featured BOOLEAN NOT NULL DEFAULT false,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_article_ids UUID[] NOT NULL DEFAULT '{}',
  disclaimer_key TEXT,
  reviewed_by TEXT,
  review_date DATE,
  canonical_override TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.editorial_articles TO anon, authenticated;
GRANT ALL ON public.editorial_articles TO service_role;
ALTER TABLE public.editorial_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles public read published" ON public.editorial_articles FOR SELECT
  USING (status = 'published');
CREATE POLICY "articles editors read all" ON public.editorial_articles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "articles editors write" ON public.editorial_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER trg_editorial_articles_updated BEFORE UPDATE ON public.editorial_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_articles_status_pub ON public.editorial_articles (status, published_at DESC);
CREATE INDEX idx_articles_category ON public.editorial_articles (category_id);
CREATE INDEX idx_articles_author ON public.editorial_articles (author_id);

INSERT INTO public.editorial_categories (key, slug, label, description, icon, sort_order) VALUES
  ('astrology',     'astrologia',     'Astrología',     'Conceptos y ciclos para leer el cielo.',       'premium',       10),
  ('tarot',         'tarot',          'Tarot',          'Tiradas simples para escuchar el momento.',    'tarot',         20),
  ('moon',          'luna',           'Luna',           'Fase actual y calendario lunar.',              'moon',          30),
  ('compatibility', 'compatibilidad', 'Compatibilidad', 'Cómo dialogan dos signos entre sí.',           'compatibility', 40),
  ('horoscope',     'horoscopo',      'Horóscopo',      'Lecturas diarias, semanales y por signo.',     'sun',           50),
  ('editorial',     'editorial',      'Editorial',      'Ensayos y artículos editoriales.',             'article',       60);

INSERT INTO public.editorial_authors (slug, name, role_label, bio)
VALUES ('equipo-editorial', 'Equipo editorial', 'Redacción de Proyecto Astral',
  'Colectivo editorial responsable de la revisión y curaduría del contenido de Proyecto Astral.');

INSERT INTO public.editorial_articles
  (slug, title, subtitle, excerpt, category_id, author_id, status, image_alt, content, seo, tags, reading_time, featured, home_featured, is_demo, published_at)
SELECT
  'articulo-de-demostracion',
  'Artículo de demostración del sistema editorial',
  'Contenido de ejemplo — reemplazar antes de publicar',
  'Este artículo existe únicamente para validar la plantilla editorial, las consultas a base de datos, el SEO, las categorías y los estados de publicación. No representa contenido definitivo.',
  c.id, a.id, 'published',
  'Ilustración editorial abstracta',
  jsonb_build_array(
    jsonb_build_object('type','paragraph','text','Este es un artículo de demostración creado como parte de la infraestructura editorial. Sirve para verificar que las páginas de guías, categorías, autores y detalle de artículo consultan correctamente la base de datos.'),
    jsonb_build_object('type','heading','level',2,'id','proposito','text','Propósito de este contenido'),
    jsonb_build_object('type','paragraph','text','Se usa para validar la plantilla, la tabla de contenidos, la barra de progreso, el bloque de autor y los datos estructurados. Puede eliminarse o reemplazarse sin afectar al resto del sistema.'),
    jsonb_build_object('type','callout','variant','context','title','Contenido de demostración','content','Este artículo no forma parte del inventario editorial definitivo y no debe considerarse una referencia real.'),
    jsonb_build_object('type','heading','level',2,'id','estructura','text','Estructura editorial'),
    jsonb_build_object('type','list','style','unordered','items', jsonb_build_array('Categoría, autor y estado gestionados desde base de datos.','Bloques de contenido tipados y renderizados por un componente único.','SEO editorial con Article schema y breadcrumbs.')),
    jsonb_build_object('type','disclaimer','disclaimer_key','general')
  ),
  jsonb_build_object(
    'title','Artículo de demostración — Proyecto Astral',
    'description','Contenido de ejemplo utilizado para validar la infraestructura editorial de Proyecto Astral.',
    'og_title','Artículo de demostración',
    'og_description','Contenido de ejemplo utilizado para validar la infraestructura editorial.'
  ),
  ARRAY['demostracion','sistema-editorial']::text[],
  4, true, true, true, now()
FROM public.editorial_categories c, public.editorial_authors a
WHERE c.key = 'editorial' AND a.slug = 'equipo-editorial';
