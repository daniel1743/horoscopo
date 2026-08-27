import type { EditorialArticle, EditorialAuthor, EditorialCategory } from "@/types/editorial";

export const localGuideAuthor: EditorialAuthor = {
  id: "local-author-equipo-editorial",
  slug: "equipo-editorial",
  name: "Equipo editorial",
  roleLabel: "Curaduría y edición Creovision",
  bio: "Equipo responsable de revisar y contextualizar los contenidos de Creovision.",
  avatarUrl: null,
};

export const localGuideCategories: EditorialCategory[] = [
  {
    id: "local-category-astrology",
    key: "astrology",
    slug: "astrologia",
    label: "Astrología",
    description: "Conceptos y ciclos para leer el cielo.",
    icon: null,
    sortOrder: 10,
  },
  {
    id: "local-category-tarot",
    key: "tarot",
    slug: "tarot",
    label: "Tarot",
    description: "Lecturas simbólicas para reflexionar con calma.",
    icon: null,
    sortOrder: 20,
  },
  {
    id: "local-category-moon",
    key: "moon",
    slug: "luna",
    label: "Luna",
    description: "Fases y ciclos observables del cielo.",
    icon: null,
    sortOrder: 30,
  },
  {
    id: "local-category-compatibility",
    key: "compatibility",
    slug: "compatibilidad",
    label: "Compatibilidad",
    description: "Conversaciones entre signos y ritmos.",
    icon: null,
    sortOrder: 40,
  },
  {
    id: "local-category-horoscope",
    key: "horoscope",
    slug: "horoscopo",
    label: "Horóscopo",
    description: "Lecturas diarias con contexto y criterio.",
    icon: null,
    sortOrder: 50,
  },
  {
    id: "local-category-editorial",
    key: "editorial",
    slug: "editorial",
    label: "Editorial",
    description: "Ensayos sobre símbolos, método y responsabilidad.",
    icon: null,
    sortOrder: 60,
  },
];

export const localGuideArticles: EditorialArticle[] = [
  {
    id: "local-guide-como-leer-una-carta-natal-sin-convertirla-en-una-sentencia",
    slug: "como-leer-una-carta-natal-sin-convertirla-en-una-sentencia",
    title: "Cómo leer una carta natal sin convertirla en una sentencia",
    subtitle:
      "La carta natal es un lenguaje simbólico que ofrece pistas para la reflexión, no una sentencia sobre quién eres. Al abordar una carta con curiosidad y ",
    excerpt:
      "La carta natal es un lenguaje simbólico que ofrece pistas para la reflexión, no una sentencia sobre quién eres. Al abordar una carta con curiosidad y compasión puedes extraer posibilidades en lugar de etiquetas fijas. Es",
    categoryId: "local-category-astrology",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "heading",
        level: 2,
        id: "una-carta-como-mapa-no-como-veredicto",
        text: "Una carta como mapa, no como veredicto",
      },
      {
        type: "paragraph",
        text: "La carta natal es un lenguaje simbólico que ofrece pistas para la reflexión, no una sentencia sobre quién eres. Al abordar una carta con curiosidad y compasión puedes extraer posibilidades en lugar de etiquetas fijas. Esta guía propone pasos prácticos para leer con perspectiva: entender tendencias, conectar matices y mantener siempre tu capacidad de elección y transformación.",
      },
      {
        type: "heading",
        level: 2,
        id: "empieza-por-los-elementos-y-las-energias-no-por-la-culpa",
        text: "Empieza por los elementos y las energías, no por la culpa",
      },
      {
        type: "paragraph",
        text: "Antes de saltar a conclusiones, identifica los elementos (fuego, tierra, aire, agua) y las modalidades (cardinal, fijo, mutable). Estos patrones muestran estilos de respuesta y recursos naturales, no defectos. Interpretar la composición elemental te ayuda a comprender cómo te recargas, qué te cuesta y qué estrategias prácticas puedes adoptar para equilibrar la vida cotidiana sin juzgarte.",
      },
      {
        type: "heading",
        level: 2,
        id: "contextualiza-los-aspectos-conversaciones-no-juicios",
        text: "Contextualiza los aspectos: conversaciones, no juicios",
      },
      {
        type: "paragraph",
        text: "Los aspectos entre planetas representan diálogos simbólicos: tensiones, armonías y alianzas internas. Mira esos intercambios como dinámicas que puedes observar y modular, no como condenas inevitables. Pregúntate qué voz interna habla más alto, qué parte necesita espacio y cómo esas conversaciones influyen en decisiones concretas, relaciones y proyectos. La interpretación compasiva abre opciones de respuesta.",
      },
      {
        type: "heading",
        level: 2,
        id: "lee-en-capas-prioridades-matices-y-practica-cotidiana",
        text: "Lee en capas: prioridades, matices y práctica cotidiana",
      },
      {
        type: "paragraph",
        text: "Haz la lectura por etapas: identifica primero Sol, Luna y Ascendente; luego mira casas asociadas y regentes; finalmente explora aspectos y transitos relevantes. Este orden te permite separar lo esencial de los detalles y aplicar insights de forma práctica: pequeños experimentos diarios, cambios de perspectiva y metas ajustadas a tus ritmos naturales sin convertir la carta en destino.",
      },
      {
        type: "heading",
        level: 2,
        id: "integra-la-interpretacion-con-tu-agencia-personal",
        text: "Integra la interpretación con tu agencia personal",
      },
      {
        type: "paragraph",
        text: "La carta ofrece un vocabulario simbólico; tu experiencia da sentido. Usa la lectura para iluminar patrones, no para justificarlos. Combina observación con acción: prueba nuevas rutinas, conversa sobre tus temores, cultiva habilidades donde hay desafío. Interpretar desde la responsabilidad afectiva y la curiosidad te permite transformar tendencias en competencias, manteniendo siempre la capacidad de elegir y cambiar.",
      },
      {
        type: "heading",
        level: 2,
        id: "lista-para-una-lectura-compasiva",
        text: "Lista para una lectura compasiva",
      },
      {
        type: "paragraph",
        text: "- Respira antes de interpretar. - Identifica primero tres puntos clave (Sol, Luna, Ascendente). - Anota dos cualidades y dos oportunidades para cada punto. - Pregúntate: ¿qué puedo probar esta semana? - Evita frases absolutas; usa ‘puede’ y ‘tendencia’. - Busca apoyo si la lectura despierta emociones intensas.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-para-profundizar-despues-de-la-lectura",
        text: "Preguntas para profundizar después de la lectura",
      },
      {
        type: "paragraph",
        text: "¿Qué sello recurrente aparece en mi carta y cómo lo vivo hoy? ¿Qué voz interna se siente más escuchada por mi entorno? ¿Qué pequeño experimento puedo diseñar para explorar una cualidad nueva? ¿Dónde quiero ejercer más compasión conmigo mismo frente a las dificultades que plantea la carta? ¿Qué apoyo externo podría acompañarme en este proceso?",
      },
      {
        type: "heading",
        level: 2,
        id: "aviso",
        text: "Aviso",
      },
      {
        type: "paragraph",
        text: "Este texto presenta la astrología como un idioma simbólico y de reflexión personal. No ofrece diagnósticos médicos, jurídicos ni financieros, ni predice hechos inevitables. Si surgen dudas de salud, legales o económicas, consulta a profesionales acreditados. Usa la carta natal como herramienta de autoconocimiento y toma decisiones conscientes basadas en múltiples fuentes y en tu propio juicio.",
      },
    ],
    seo: {
      title: "Cómo leer una carta natal sin convertirla en una sentencia | Creovision",
      description:
        "La carta natal es un lenguaje simbólico que ofrece pistas para la reflexión, no una sentencia sobre quién eres. Al abordar una carta con curiosidad y compasión puedes extraer posibilidades en lugar de etiquetas fijas. Es",
      og_title: "Cómo leer una carta natal sin convertirla en una sentencia",
      og_description:
        "La carta natal es un lenguaje simbólico que ofrece pistas para la reflexión, no una sentencia sobre quién eres. Al abordar una carta con curiosidad y compasión puedes extraer posibilidades en lugar de etiquetas fijas. Es",
    },
    tags: ["astrologia", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-ascendente-signo-lunar-y-sol-tres-capas-para-conocerte-mejor",
    slug: "ascendente-signo-lunar-y-sol-tres-capas-para-conocerte-mejor",
    title: "Ascendente, signo lunar y Sol: tres capas para conocerte mejor",
    subtitle:
      "Sol, Luna y Ascendente forman un triángulo simbólico que ayuda a comprender diferentes facetas del yo: identidad consciente, mundo emocional y máscara",
    excerpt:
      "Sol, Luna y Ascendente forman un triángulo simbólico que ayuda a comprender diferentes facetas del yo: identidad consciente, mundo emocional y máscara social o estilo de aparición. Conocer cómo dialogan entre sí permite",
    categoryId: "local-category-astrology",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "heading",
        level: 2,
        id: "tres-voces-una-experiencia-como-leer-las-capas",
        text: "Tres voces, una experiencia: cómo leer las capas",
      },
      {
        type: "paragraph",
        text: "Sol, Luna y Ascendente forman un triángulo simbólico que ayuda a comprender diferentes facetas del yo: identidad consciente, mundo emocional y máscara social o estilo de aparición. Conocer cómo dialogan entre sí permite integrar deseos, necesidades y la manera en que te presentas al mundo. Esta guía breve ofrece prácticas para escuchar y armonizar esas tres capas sin reducirte a etiquetas.",
      },
      {
        type: "heading",
        level: 2,
        id: "sol-la-brujula-de-sentido-y-proposito",
        text: "Sol: la brújula de sentido y propósito",
      },
      {
        type: "paragraph",
        text: "El Sol simboliza la orientación vital y los temas que emergen con fuerza en tu autopercepción. Para trabajar con esa capa, identifica palabras clave que describan tu centro de interés y diseña acciones coherentes con ellas: proyectos creativos, rutinas que fortalezcan tu energía y declaraciones de intención. El Sol es guía, no sentencia; prueba pequeñas metas que alineen intención y práctica.",
      },
      {
        type: "heading",
        level: 2,
        id: "luna-el-mapa-de-tus-ritmos-emocionales",
        text: "Luna: el mapa de tus ritmos emocionales",
      },
      {
        type: "paragraph",
        text: "La Luna señala cómo sientes y te nutres emocionalmente. Observa patrones de seguridad, reacciones automáticas y necesidades afectivas. Registra durante una semana cuándo te sientes reconfortado y cuándo sensible; ajusta autocuidado según esos ritmos. Entender la Luna te ayuda a responder a tus emociones con ternura en vez de reaccionar impulsivamente, favoreciendo relaciones más honestas y equilibradas.",
      },
      {
        type: "heading",
        level: 2,
        id: "ascendente-la-gama-que-presentas-al-mundo",
        text: "Ascendente: la gama que presentas al mundo",
      },
      {
        type: "paragraph",
        text: "El Ascendente describe el estilo con que te proyectas y cómo otros te perciben inicialmente. Explora tu lenguaje corporal, tu forma de comunicarte y la primera impresión que dejas: pequeños experimentos de vestimenta, tono y postura pueden revelar consistencias y disonancias con lo que sientes por dentro. Ajusta esa presencia según lo que quieras mostrar, sin perder autenticidad.",
      },
      {
        type: "heading",
        level: 2,
        id: "mini-practica-para-integrar-las-tres-capas",
        text: "Mini-práctica para integrar las tres capas",
      },
      {
        type: "paragraph",
        text: "- Escribe en tres columnas: Sol (intención), Luna (necesidad), Ascendente (acto). - Elige una acción diaria que honre cada columna. - Al final del día, anota una observación: ¿qué resonó, qué resistió? - Repite durante una semana para detectar patrones y ajustes prácticos.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-que-facilitan-la-integracion",
        text: "Preguntas que facilitan la integración",
      },
      {
        type: "paragraph",
        text: "¿Qué deseo del Sol necesita más espacio en mi vida cotidiana? ¿Qué señales de la Luna paso por alto y cómo podría nutrirme mejor? ¿En qué situaciones mi Ascendente me protege o me limita? ¿Cómo puedo alinear actuación, emoción e intención sin dejar de ser auténtico? ¿Qué experimento small-scale probaré esta semana?",
      },
      {
        type: "heading",
        level: 2,
        id: "aviso",
        text: "Aviso",
      },
      {
        type: "paragraph",
        text: "Estos enfoques presentan la astrología como herramienta simbólica para la reflexión personal, no como diagnóstico ni predicción absoluta. No sustituyen asesoramiento médico, legal o financiero profesional. Si un trabajo astrológico moviliza emociones intensas, considera acompañamiento terapéutico. Usa estas ideas como apoyo para la autoobservación y la toma de decisiones conscientes.",
      },
    ],
    seo: {
      title: "Ascendente, signo lunar y Sol: tres capas para conocerte mejor | Creovision",
      description:
        "Sol, Luna y Ascendente forman un triángulo simbólico que ayuda a comprender diferentes facetas del yo: identidad consciente, mundo emocional y máscara social o estilo de aparición. Conocer cómo dialogan entre sí permite",
      og_title: "Ascendente, signo lunar y Sol: tres capas para conocerte mejor",
      og_description:
        "Sol, Luna y Ascendente forman un triángulo simbólico que ayuda a comprender diferentes facetas del yo: identidad consciente, mundo emocional y máscara social o estilo de aparición. Conocer cómo dialogan entre sí permite",
    },
    tags: ["astrologia", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-como-hacer-una-pregunta-util-antes-de-sacar-una-carta",
    slug: "como-hacer-una-pregunta-util-antes-de-sacar-una-carta",
    title: "Cómo hacer una pregunta útil antes de sacar una carta",
    subtitle:
      "Antes de barajar y escoger una carta, la claridad de tu pregunta condiciona la lectura simbólica. Una buena pregunta abre un espacio de reflexión: señ",
    excerpt:
      "Antes de barajar y escoger una carta, la claridad de tu pregunta condiciona la lectura simbólica. Una buena pregunta abre un espacio de reflexión: señala un foco, acepta la incertidumbre y permite que las imágenes del ta",
    categoryId: "local-category-tarot",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "paragraph",
        text: "Antes de barajar y escoger una carta, la claridad de tu pregunta condiciona la lectura simbólica. Una buena pregunta abre un espacio de reflexión: señala un foco, acepta la incertidumbre y permite que las imágenes del tarot actúen como espejo. Aquí encontrarás pasos concretos para formular consultas que favorezcan la comprensión y el crecimiento personal, sin buscar certezas absolutas ni respuestas que substituyan tu juicio.",
      },
      {
        type: "heading",
        level: 2,
        id: "1-define-tu-intencion-con-precision",
        text: "1. Define tu intención con precisión",
      },
      {
        type: "paragraph",
        text: "Empieza por nombrar qué quieres explorar: emociones, decisiones, una relación o un aprendizaje. La intención no necesita detallar cada circunstancia, pero sí delimitar el terreno de la consulta. Por ejemplo, en lugar de “¿qué pasará?”, piensa “¿qué puedo aprender sobre mi situación laboral en este momento?”: la intención orienta la interpretación hacia desarrollo y sentido, no hacia predicción fría.",
      },
      {
        type: "heading",
        level: 2,
        id: "2-formula-preguntas-abiertas-y-accionables",
        text: "2. Formula preguntas abiertas y accionables",
      },
      {
        type: "paragraph",
        text: "Prefiere preguntas que inviten a matices —cómo, qué, qué necesito saber— sobre las expectactivas cerradas de sí/no. Las preguntas abiertas permiten explorar posibles factores, recursos internos y obstáculos. También es útil incluir un horizonte temporal razonable (ej.: “en los próximos meses”) para que la carta hable de procesos, no de eventos instantáneos, y así favorezca la reflexión práctica.",
      },
      {
        type: "heading",
        level: 2,
        id: "3-evita-proyectar-culpa-o-demandas-absolutas",
        text: "3. Evita proyectar culpa o demandas absolutas",
      },
      {
        type: "paragraph",
        text: "No plantees preguntas que busquen identificar culpables o condenas definitivas. El tarot funciona mejor como lenguaje simbólico que revela dinámicas y potenciales. Si la pregunta nace de ansiedad o urgencia, respira, reformúlala y céntrala en aprendizaje personal: en vez de “¿me hará daño X?” prueba “¿qué necesito saber sobre la dinámica entre X y yo para cuidarme mejor?”",
      },
      {
        type: "heading",
        level: 2,
        id: "4-comprueba-tus-supuestos-antes-de-preguntar",
        text: "4. Comprueba tus supuestos antes de preguntar",
      },
      {
        type: "paragraph",
        text: "A menudo las preguntas contienen premisas no examinadas. Haz un rápido sondeo interior: ¿supongo que debo cambiar de trabajo? ¿doy por hecho que no hay solución? Detectar esas creencias previas te permite ajustar la pregunta para que la carta ofrezca información útil en vez de reafirmar un prejuicio. La honestidad sobre tus supuestos abre lecturas más honestas y transformadoras.",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "En vez de “¿me dejará mi pareja?”, prueba “¿qué me muestra esta situación sobre mis necesidades afectivas?”",
          "En vez de “¿conseguiré ese trabajo?”, prueba “¿qué pasos puedo considerar para mejorar mis opciones profesionales?”",
          "En vez de “¿por qué me pasa esto a mí?”, prueba “¿qué recursos internos o externos puedo activar ahora?”",
          "En vez de “¿esto es bueno o malo?”, prueba “¿qué aprendizajes potenciales hay en esta experiencia?”",
        ],
      },
      {
        type: "paragraph",
        text: "Antes de sacar una carta, toma un minuto para responder internamente a estas preguntas: ¿qué quiero aprender de esta situación?, ¿qué emoción domina mi consulta?, ¿qué resultado estoy esperando y por qué?, ¿qué parte de la respuesta me pertenece como responsabilidad? Estas reflexiones no buscan respuestas definitivas sino orientar la lectura hacia la comprensión y la acción responsable.",
      },
      {
        type: "paragraph",
        text: "El tarot es un lenguaje simbólico y de reflexión; no garantiza resultados ni sustituye el criterio profesional. Las sugerencias de este artículo buscan ayudarte a formular consultas más claras y útiles para tu proceso personal. No se ofrecen diagnósticos médicos, legales ni financieros. Si necesitas orientación en esos ámbitos, consulta a un profesional adecuado. Fuentes de referencia sobre el tarot: https://www.britannica.com/topic/tarot, https://www.britannica.com/topic/Major-Arcana",
      },
    ],
    seo: {
      title: "Cómo hacer una pregunta útil antes de sacar una carta | Creovision",
      description:
        "Antes de barajar y escoger una carta, la claridad de tu pregunta condiciona la lectura simbólica. Una buena pregunta abre un espacio de reflexión: señala un foco, acepta la incertidumbre y permite que las imágenes del ta",
      og_title: "Cómo hacer una pregunta útil antes de sacar una carta",
      og_description:
        "Antes de barajar y escoger una carta, la claridad de tu pregunta condiciona la lectura simbólica. Una buena pregunta abre un espacio de reflexión: señala un foco, acepta la incertidumbre y permite que las imágenes del ta",
    },
    tags: ["tarot", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/tarot",
      },
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/Major-Arcana",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-carta-al-derecho-y-carta-invertida-leer-matices-no-condenas",
    slug: "carta-al-derecho-y-carta-invertida-leer-matices-no-condenas",
    title: "Carta al derecho y carta invertida: leer matices, no condenas",
    subtitle:
      "La posición de una carta —al derecho o invertida— añade capas de significado que enriquecen una lectura, no la dictan. Pensar en derecho/invertida com",
    excerpt:
      "La posición de una carta —al derecho o invertida— añade capas de significado que enriquecen una lectura, no la dictan. Pensar en derecho/invertida como variaciones de énfasis y energía ayuda a evitar lecturas absolutas",
    categoryId: "local-category-tarot",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "paragraph",
        text: "La posición de una carta —al derecho o invertida— añade capas de significado que enriquecen una lectura, no la dictan. Pensar en derecho/invertida como variaciones de énfasis y energía ayuda a evitar lecturas absolutas. Este artículo ofrece claves prácticas para interpretar matices, desplegar posibilidades y comprender cómo el contexto y la pregunta orientan el sentido de cada posición.",
      },
      {
        type: "heading",
        level: 2,
        id: "1-comprende-la-inversion-como-una-variacion-no-una-sentencia",
        text: "1. Comprende la inversión como una variación, no una sentencia",
      },
      {
        type: "paragraph",
        text: "Una carta invertida puede señalar una energía bloqueada, un aspecto interior más oculto o un proceso en desarrollo. No necesariamente significa “negativo”; muchas veces indica que la cualidad de la carta está dirigida hacia dentro, necesita ajuste o requiere atención práctica. Leer con apertura evita transformarla en un veredicto que paraliza en vez de invitar a la reflexión.",
      },
      {
        type: "heading",
        level: 2,
        id: "2-observa-la-relacion-entre-la-carta-y-la-pregunta",
        text: "2. Observa la relación entre la carta y la pregunta",
      },
      {
        type: "paragraph",
        text: "El mismo arcano puede hablar distinto según la consulta; la inversión modifica esa voz en función del contexto. Por ejemplo, en una pregunta sobre creatividad, una carta invertida puede señalar bloqueo creativo o la necesidad de renovar métodos; en una consulta sobre límites, puede indicar dificultad para sostenerlos. Pregúntate siempre cómo la posición dialoga con la intención de la lectura.",
      },
      {
        type: "heading",
        level: 2,
        id: "3-usa-el-mazo-y-las-cartas-vecinas-como-mapa",
        text: "3. Usa el mazo y las cartas vecinas como mapa",
      },
      {
        type: "paragraph",
        text: "Las cartas que rodean a la carta invertida ayudan a precisar su función: si aparecen arcanos de acción, la inversión puede señalar retrasos; si hay cartas de introspección, puede indicar trabajo interno. Observa la narrativa visual y simbólica del conjunto: las imágenes, elementos y números aportan claves para interpretar si la inversión es una alerta, una invitación a mirar adentro o una transición.",
      },
      {
        type: "heading",
        level: 2,
        id: "4-tecnicas-practicas-para-integrar-inversiones-en-la-lectura",
        text: "4. Técnicas prácticas para integrar inversiones en la lectura",
      },
      {
        type: "paragraph",
        text: "Prueba preguntar “¿qué me pide ver esta carta invertida?” o girar la carta y leer ambas posiciones como diálogo: ¿qué dice al derecho y qué añade invertida? Otra técnica útil es considerar la inversión como aspecto temporal (algo pendiente) o actitudinal (cómo se manifiesta la energía en la persona). Registrar interpretaciones te ayuda a refinar tu sentido con la práctica.",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "El Loco al derecho: inicio, confianza. Invertido: impulsividad o resistencia a comenzar; revisar riesgos y preparativos.",
          "La Emperatriz al derecho: abundancia y cuidado. Invertida: bloqueo creativo o necesidad de cuidar los límites personales.",
          "Tres de Espadas al derecho: dolor y separación. Invertido: procesos de sanación o tristeza contenida que pide atención.",
        ],
      },
      {
        type: "paragraph",
        text: "Al encontrar una carta invertida, considera estas preguntas: ¿qué aspecto interior está pidiendo presencia?, ¿esta inversión señala una pausa, un bloqueo o una invitación?, ¿qué recurso práctico puedo activar para trabajar este matiz?, ¿cómo dialoga esto con mi pregunta inicial? Responderlas con calma transforma la inversión en una herramienta de autoconocimiento.",
      },
      {
        type: "paragraph",
        text: "El tarot se presenta aquí como un lenguaje simbólico para la reflexión personal; no ofrece certezas ni reemplaza asesoría profesional. Las interpretaciones sugeridas son orientativas y buscan fomentar lectura responsable y consciente. No se hacen diagnósticos ni se dan consejos médicos, legales o financieros. Para mayor contexto sobre el tarot y los arcanos, puedes consultar: https://www.britannica.com/topic/tarot, https://www.britannica.com/topic/Major-Arcana",
      },
    ],
    seo: {
      title: "Carta al derecho y carta invertida: leer matices, no condenas | Creovision",
      description:
        "La posición de una carta —al derecho o invertida— añade capas de significado que enriquecen una lectura, no la dictan. Pensar en derecho/invertida como variaciones de énfasis y energía ayuda a evitar lecturas absolutas",
      og_title: "Carta al derecho y carta invertida: leer matices, no condenas",
      og_description:
        "La posición de una carta —al derecho o invertida— añade capas de significado que enriquecen una lectura, no la dictan. Pensar en derecho/invertida como variaciones de énfasis y energía ayuda a evitar lecturas absolutas",
    },
    tags: ["tarot", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/tarot",
      },
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/Major-Arcana",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-las-ocho-fases-de-la-luna-que-observamos-realmente-en-el-cielo",
    slug: "las-ocho-fases-de-la-luna-que-observamos-realmente-en-el-cielo",
    title: "Las ocho fases de la Luna: qué observamos realmente en el cielo",
    subtitle:
      "Cuando hablamos de las ocho fases lunares nos referimos a etiquetas que describen cómo vemos la Luna desde la Tierra según su iluminación por el Sol. ",
    excerpt:
      "Cuando hablamos de las ocho fases lunares nos referimos a etiquetas que describen cómo vemos la Luna desde la Tierra según su iluminación por el Sol. Estas fases no son fuerzas, son observaciones: patrones repetitivos qu",
    categoryId: "local-category-moon",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "heading",
        level: 2,
        id: "apertura-una-lectura-clara-de-lo-que-vemos",
        text: "Apertura: una lectura clara de lo que vemos",
      },
      {
        type: "paragraph",
        text: "Cuando hablamos de las ocho fases lunares nos referimos a etiquetas que describen cómo vemos la Luna desde la Tierra según su iluminación por el Sol. Estas fases no son fuerzas, son observaciones: patrones repetitivos que surgen por la geometría entre Sol, Tierra y Luna. Conocerlas ayuda a orientarnos en el cielo, planear observaciones y conversar sobre ritmos visibles, sin convertir la observación en determinismo.",
      },
      {
        type: "heading",
        level: 2,
        id: "que-significa-cada-fase",
        text: "Qué significa cada fase",
      },
      {
        type: "paragraph",
        text: "Las ocho fases son nombres prácticos que describen el crecimiento y decrecimiento de la porción iluminada que alcanzamos a ver: Luna nueva, creciente creciente, primer cuarto, gibosa creciente, Luna llena, gibosa menguante, último cuarto y creciente menguante. Cada etiqueta resume un aspecto de la cara iluminada y su posición relativa al Sol, útil para identificar rápidamente cómo y cuándo aparecerá la Luna en el horizonte.",
      },
      {
        type: "heading",
        level: 2,
        id: "la-geometria-detras-de-las-fases",
        text: "La geometría detrás de las fases",
      },
      {
        type: "paragraph",
        text: "Las fases son resultado directo del ángulo entre el Sol, la Luna y la Tierra; la porción iluminada visible cambia conforme la Luna recorre su órbita. Ese ciclo observable, llamado mes sinódico, dura cerca de 29.5 días y determina cuándo se repite la secuencia de fases. Comprender eso nos permite dejar de lado interpretaciones causales y concentrarnos en una explicación física y verificable de lo que observamos.",
      },
      {
        type: "heading",
        level: 2,
        id: "variaciones-sutiles-libracion-y-distancia-aparente",
        text: "Variaciones sutiles: libración y distancia aparente",
      },
      {
        type: "paragraph",
        text: "Aunque las ocho fases describen el patrón general, la Luna muestra pequeñas variaciones: la libración permite ver un poco más de su superficie en distintos momentos y la órbita elíptica provoca cambios en su tamaño aparente entre perigeo y apogeo. Esas diferencias no alteran las fases básicas, pero enriquecen lo que captan los observadores atentos y explican por qué no todas las lunas llenas se ven idénticas.",
      },
      {
        type: "heading",
        level: 2,
        id: "listado-breve-para-recordar",
        text: "Listado breve para recordar",
      },
      {
        type: "paragraph",
        text: "Puntos clave: la Luna pasa por ocho fases reconocibles; la duración del ciclo sinódico es de aproximadamente 29,5 días; la Luna nueva suele ser invisible porque está cerca del Sol en el cielo; la Luna llena es visible durante la noche completa. Estas notas sirven para observación práctica y no para atribuir efectos causales a los ciclos lunares.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-para-reflexionar-mientras-observas",
        text: "Preguntas para reflexionar mientras observas",
      },
      {
        type: "paragraph",
        text: "¿Cómo cambia tu experiencia al mirar la Luna cuando sabes que es una relación geométrica entre cuerpos celestes? ¿Qué detalles observas que no encajen exactamente con las etiquetas de fase? ¿Qué significado personal o simbólico, si alguno, eliges darle a esas fases sin pretender que influyan directamente en eventos concretos de la vida cotidiana?",
      },
      {
        type: "heading",
        level: 2,
        id: "disclaimer",
        text: "Disclaimer",
      },
      {
        type: "paragraph",
        text: "Este texto explica observaciones y fundamentos astronómicos; no ofrece diagnósticos ni consejos médicos, legales o financieros. El Tarot y la astrología se mencionan como lenguajes simbólicos y de reflexión, no como herramientas predictivas científicas. Para decisiones que requieran especialización, consulta a profesionales. Los conceptos astronómicos señalados se basan en observaciones y recursos científicos listados en las fuentes.",
      },
    ],
    seo: {
      title: "Las ocho fases de la Luna: qué observamos realmente en el cielo | Creovision",
      description:
        "Cuando hablamos de las ocho fases lunares nos referimos a etiquetas que describen cómo vemos la Luna desde la Tierra según su iluminación por el Sol. Estas fases no son fuerzas, son observaciones: patrones repetitivos qu",
      og_title: "Las ocho fases de la Luna: qué observamos realmente en el cielo",
      og_description:
        "Cuando hablamos de las ocho fases lunares nos referimos a etiquetas que describen cómo vemos la Luna desde la Tierra según su iluminación por el Sol. Estas fases no son fuerzas, son observaciones: patrones repetitivos qu",
    },
    tags: ["luna", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://science.nasa.gov/moon/moon-phases/",
      },
      {
        label: "Fuente de referencia",
        url: "https://science.nasa.gov/moon/daily-moon-guide/",
      },
      {
        label: "Fuente de referencia",
        url: "https://aa.usno.navy.mil/data/MoonPhases",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-calendario-lunar-como-usar-fechas-astronomicas-sin-atribuir-causalidades",
    slug: "calendario-lunar-como-usar-fechas-astronomicas-sin-atribuir-causalidades",
    title: "Calendario lunar: cómo usar fechas astronómicas sin atribuir causalidades",
    subtitle:
      "Un calendario lunar que incorpora fechas astronómicas ofrece instantes concretos —por ejemplo, el momento exacto de Luna nueva o llena— calculados por",
    excerpt:
      "Un calendario lunar que incorpora fechas astronómicas ofrece instantes concretos —por ejemplo, el momento exacto de Luna nueva o llena— calculados por efemérides. Esos datos son herramientas útiles para observar, fotogra",
    categoryId: "local-category-moon",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "heading",
        level: 2,
        id: "apertura-fechas-que-informan-no-que-determinan",
        text: "Apertura: fechas que informan, no que determinan",
      },
      {
        type: "paragraph",
        text: "Un calendario lunar que incorpora fechas astronómicas ofrece instantes concretos —por ejemplo, el momento exacto de Luna nueva o llena— calculados por efemérides. Esos datos son herramientas útiles para observar, fotografiar o seguir ciclos, pero no constituyen causas para eventos personales. Conviene separar la información técnica (cuándo ocurre un fenómeno) de las interpretaciones simbólicas que podamos querer aplicar.",
      },
      {
        type: "heading",
        level: 2,
        id: "que-registra-un-calendario-lunar-astronomico",
        text: "Qué registra un calendario lunar astronómico",
      },
      {
        type: "paragraph",
        text: "Los calendarios basados en cómputos astronómicos anotan instantes en los que los ángulos Sol-Luna-Tierra alcanzan condiciones específicas: conjunción (Luna nueva), cuadraturas (primer y último cuarto) y oposición (Luna llena). También pueden incluir perigeos, apogeos y nodos. Es importante recordar que esas marcas son momentos matemáticos medidos habitualmente en UTC y que la visibilidad desde un lugar concreto puede variar.",
      },
      {
        type: "heading",
        level: 2,
        id: "como-usar-las-fechas-recomendaciones-practicas",
        text: "Cómo usar las fechas: recomendaciones prácticas",
      },
      {
        type: "paragraph",
        text: "Usa las fechas astronómicas como guía para programación de observaciones, fotografía y actividades simbólicas conscientes, comprobando siempre la zona horaria local y la diferencia entre instante astronómico y momento de mejor visibilidad. Si necesitas precisión, consulta una efeméride confiable o una librería de cálculo que convierta instantes a tu horario local y tenga en cuenta estándares temporales como UTC y segundos intercalares.",
      },
      {
        type: "heading",
        level: 2,
        id: "herramientas-confiables-y-sus-limites",
        text: "Herramientas confiables y sus límites",
      },
      {
        type: "paragraph",
        text: "Fuentes como agencias científicas y efemérides públicas ofrecen cálculos fiables; existen además bibliotecas de código abierto y motores como Swiss Ephemeris o proyectos de astronomía que calculan fases y posiciones. Ten presente que distintos modelos y actualizaciones pueden dar pequeñas discrepancias en segundos o minutos; para la observación práctica esas diferencias son apenas perceptibles, pero conviene verificar la procedencia y la precisión del dato.",
      },
      {
        type: "heading",
        level: 2,
        id: "checklist-rapido-para-usar-un-calendario-lunar",
        text: "Checklist rápido para usar un calendario lunar",
      },
      {
        type: "paragraph",
        text: "Verifica la fuente y la zona horaria; distingue entre instante astronómico y visibilidad local; usa los datos para planificar observaciones, no para atribuir efectos causales; en la duda, compara dos efemérides independientes; recuerda que pequeñas discrepancias son normales entre modelos de cálculo.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-para-integrar-datos-y-significado",
        text: "Preguntas para integrar datos y significado",
      },
      {
        type: "paragraph",
        text: "¿Para qué quieres usar un calendario lunar: observación, registro o reflexión simbólica? ¿Cómo convertirás instantes en horarios locales sin asumir resultados causales? ¿Qué límites te impones para que el uso de las fechas sea práctico y respetuoso con la naturaleza probabilística de muchos eventos humanos?",
      },
      {
        type: "heading",
        level: 2,
        id: "disclaimer",
        text: "Disclaimer",
      },
      {
        type: "paragraph",
        text: "La información sobre fechas astronómicas es descriptiva y calculada con modelos científicos; no debe interpretarse como predicción de sucesos personales ni como consejo médico, legal o financiero. El Tarot y la astrología pueden complementar reflexiones personales como lenguajes simbólicos, pero no reemplazan información técnica ni asesoría profesional. Para decisiones que requieran especialización, consulta a expertos pertinentes.",
      },
    ],
    seo: {
      title:
        "Calendario lunar: cómo usar fechas astronómicas sin atribuir causalidades | Creovision",
      description:
        "Un calendario lunar que incorpora fechas astronómicas ofrece instantes concretos —por ejemplo, el momento exacto de Luna nueva o llena— calculados por efemérides. Esos datos son herramientas útiles para observar, fotogra",
      og_title: "Calendario lunar: cómo usar fechas astronómicas sin atribuir causalidades",
      og_description:
        "Un calendario lunar que incorpora fechas astronómicas ofrece instantes concretos —por ejemplo, el momento exacto de Luna nueva o llena— calculados por efemérides. Esos datos son herramientas útiles para observar, fotogra",
    },
    tags: ["luna", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://science.nasa.gov/moon/daily-moon-guide/",
      },
      {
        label: "Fuente de referencia",
        url: "https://aa.usno.navy.mil/data/MoonPhases",
      },
      {
        label: "Fuente de referencia",
        url: "https://www.astro.com/swisseph/swisseph.htm?nhor",
      },
      {
        label: "Fuente de referencia",
        url: "https://github.com/cosinekitty/astronomy",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-compatibilidad-entre-signos-pasar-del-veredicto-a-la-conversacion",
    slug: "compatibilidad-entre-signos-pasar-del-veredicto-a-la-conversacion",
    title: "Compatibilidad entre signos: pasar del veredicto a la conversación",
    subtitle:
      "En las conversaciones sobre compatibilidad entre signos solemos quedarnos en un veredicto: compatible o incompatible. Este artículo propone cambiar es",
    excerpt:
      "En las conversaciones sobre compatibilidad entre signos solemos quedarnos en un veredicto: compatible o incompatible. Este artículo propone cambiar ese enfoque por una conversación atenta y curiosa. La astrología se pres",
    categoryId: "local-category-compatibility",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "paragraph",
        text: "En las conversaciones sobre compatibilidad entre signos solemos quedarnos en un veredicto: compatible o incompatible. Este artículo propone cambiar ese enfoque por una conversación atenta y curiosa. La astrología se presenta aquí como un lenguaje simbólico que ayuda a describir tendencias y modos de relación, no como una sentencia. Compartir observaciones abiertas facilita entender necesidades, ritmos y expectativas mutuas.",
      },
      {
        type: "heading",
        level: 2,
        id: "escuchar-el-mapa-y-la-persona",
        text: "Escuchar el mapa y la persona",
      },
      {
        type: "paragraph",
        text: "Antes de sacar conclusiones, escucha el mapa natal y la historia de las personas involucradas. Los signos solares ofrecen un punto de partida, pero la luna, el ascendente y las casas revelan matices sobre emociones, ritmo y prioridades. Pregunta por experiencias pasadas y momentos de conexión: así interpretas símbolos en contexto y evitas generalizaciones que bloquean el diálogo.",
      },
      {
        type: "heading",
        level: 2,
        id: "de-veredicto-a-curiosidad-preguntas-para-explorar",
        text: "De veredicto a curiosidad: preguntas para explorar",
      },
      {
        type: "paragraph",
        text: "Transforma etiquetas en preguntas concretas. En vez de decir 'no son compatibles', prueba preguntar: '¿Qué necesita cada uno para sentirse escuchado?', '¿Qué ritmo de comunicación funciona mejor?', '¿Qué desencadena inseguridades?'. Estas preguntas abren espacio para acuerdos y cambios reales. La curiosidad reduce la urgencia del veredicto y permite que la lectura astrológica funcione como herramienta para el entendimiento, no como sentencia final.",
      },
      {
        type: "heading",
        level: 2,
        id: "herramientas-concretas-para-una-conversacion-astrologica",
        text: "Herramientas concretas para una conversación astrológica",
      },
      {
        type: "paragraph",
        text: "Proporciona un marco práctico: escucha activa, tiempo limitado para comentarios, y acuerdos sobre vocabulario (p.ej. hablar de tendencias en vez de etiquetas). Utiliza gráficos o notas para señalar observaciones específicas —por ejemplo, diferencias de ritmo entre signos— y pide a cada persona que traduzca en ejemplos lo que leyó. Así la lectura se vuelve colaborativa y orientada a soluciones cotidianas.",
      },
      {
        type: "heading",
        level: 2,
        id: "llamado-practico-frases-que-abren-la-conversacion",
        text: "Llamado práctico: frases que abren la conversación",
      },
      {
        type: "paragraph",
        text: "Llamado práctico: seis frases que abren la conversación: 1) 'Me interesa cómo te hace sentir esto'; 2) '¿Qué necesitas ahora?' 3) '¿Puedes darme un ejemplo concreto?' 4) 'Esto me ayuda a entender tu ritmo' 5) '¿Qué acuerdos propones?' 6) '¿Cómo hacemos para probar esto una semana?'. Úsalas como puente entre símbolo y experiencia.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-de-reflexion",
        text: "Preguntas de reflexión",
      },
      {
        type: "paragraph",
        text: "Preguntas para reflexionar: ¿En qué momentos cada uno se siente escuchado o incomprendido? ¿Qué ritmos cotidianos generan tensión y cómo podrían ajustarse? ¿Qué símbolos de la carta te parecieron útiles para describir conductas concretas? ¿Qué pequeño experimento podrían acordar para la próxima semana? Responde sin buscar certezas: estas preguntas buscan observación y posibilidad, no juicios definitivos.",
      },
      {
        type: "heading",
        level: 2,
        id: "disclaimer",
        text: "Disclaimer",
      },
      {
        type: "paragraph",
        text: "Disclaimer: La astrología se presenta en este texto como un lenguaje simbólico y de reflexión; no es una ciencia predictiva ni debe usarse para tomar decisiones médicas, legales o financieras. Las sugerencias aquí son herramientas de diálogo e introspección, no diagnósticos. Si buscas orientación en ámbitos profesionales, consulta a especialistas acreditados. El objetivo es facilitar conversación responsable y respetuosa.",
      },
    ],
    seo: {
      title: "Compatibilidad entre signos: pasar del veredicto a la conversación | Creovision",
      description:
        "En las conversaciones sobre compatibilidad entre signos solemos quedarnos en un veredicto: compatible o incompatible. Este artículo propone cambiar ese enfoque por una conversación atenta y curiosa. La astrología se pres",
      og_title: "Compatibilidad entre signos: pasar del veredicto a la conversación",
      og_description:
        "En las conversaciones sobre compatibilidad entre signos solemos quedarnos en un veredicto: compatible o incompatible. Este artículo propone cambiar ese enfoque por una conversación atenta y curiosa. La astrología se pres",
    },
    tags: ["compatibilidad", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-elementos-ritmos-y-acuerdos-una-lectura-practica-de-dos-signos",
    slug: "elementos-ritmos-y-acuerdos-una-lectura-practica-de-dos-signos",
    title: "Elementos, ritmos y acuerdos: una lectura práctica de dos signos",
    subtitle:
      "Leer dos cartas natales, o dos cartas simbólicas de signos, implica mirar elementos, ritmos y cómo se traducen en acuerdos. Este enfoque práctico cons",
    excerpt:
      "Leer dos cartas natales, o dos cartas simbólicas de signos, implica mirar elementos, ritmos y cómo se traducen en acuerdos. Este enfoque práctico considera que los elementos (fuego, tierra, aire, agua) ofrecen cualidades",
    categoryId: "local-category-compatibility",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "paragraph",
        text: "Leer dos cartas natales, o dos cartas simbólicas de signos, implica mirar elementos, ritmos y cómo se traducen en acuerdos. Este enfoque práctico considera que los elementos (fuego, tierra, aire, agua) ofrecen cualidades y que los ritmos (cardinal, fijo, mutable) señalan modos de iniciar, sostener o cambiar. La lectura busca dar herramientas para que dos personas conversen con respeto y concreción sobre su convivencia.",
      },
      {
        type: "heading",
        level: 2,
        id: "lectura-inicial-elementos-y-ritmos",
        text: "Lectura inicial: elementos y ritmos",
      },
      {
        type: "paragraph",
        text: "Comienza identificando el predominio elemental en cada signo y las modalidades de acción. Un signo con fuerte presencia de fuego tiende al entusiasmo y la iniciativa; uno con predominio de tierra aporta estabilidad y concreción. Los ritmos cardinales proponen comenzar proyectos, los fijos sostenerlos y los mutables adaptarse. Esto no determina carácter absoluto, pero ofrece un vocabulario práctico para señalar cómo cada persona se mueve ante desafíos y rutinas.",
      },
      {
        type: "heading",
        level: 2,
        id: "como-mapear-coincidencias-y-tensiones",
        text: "Cómo mapear coincidencias y tensiones",
      },
      {
        type: "paragraph",
        text: "Dibuja un mapa sencillo: anota coincidencias elementales (p.ej. ambos con agua) y contrastes (agua versus fuego). Observa dónde se encuentran solapamientos —como valores, ritmos o expectativas— y dónde aparecen tensiones. Pregunta por ejemplos concretos en la convivencia diaria para validar esa lectura. El objetivo es transformar observación simbólica en información útil, identificando patrones que se repiten y momentos que requieren acuerdos explícitos o pruebas temporales.",
      },
      {
        type: "heading",
        level: 2,
        id: "ejercicios-practicos-para-dos-personas",
        text: "Ejercicios prácticos para dos personas",
      },
      {
        type: "paragraph",
        text: "Propon un ejercicio de intercambio: cada quien describe una situación reciente donde se sintió bien y otra donde hubo fricción. Luego, asocien esas escenas a elementos y ritmos: ¿fue un choque de tempos, una diferencia de prioridades o una falla de comunicación? A partir de esa descripción, creen una lista de pequeñas pruebas (una semana) para ajustar horarios, roles o modos de expresar necesidad. Registrar resultados.",
      },
      {
        type: "heading",
        level: 2,
        id: "como-traducir-la-lectura-en-acuerdos-concretos",
        text: "Cómo traducir la lectura en acuerdos concretos",
      },
      {
        type: "paragraph",
        text: "Convertir la lectura en acuerdos requiere especificidad: define qué se hará, quién lo hará, cuándo y cómo medirán si funciona. Evita términos vagos como 'más atención' y reemplázalos por acciones precisas: 'mañanas sin interrupciones de 9 a 10' o 'rotar tareas los fines de semana'. Acuerdos pequeños y evaluables reducen la carga simbólica y permiten revisar la lectura con datos de la experiencia.",
      },
      {
        type: "heading",
        level: 2,
        id: "paso-a-paso-para-una-lectura-de-dos-signos",
        text: "Paso a paso para una lectura de dos signos",
      },
      {
        type: "paragraph",
        text: "Paso a paso: 1) Identificar elementos y ritmos predominantes; 2) Preguntar por ejemplos concretos; 3) Señalar coincidencias y contrastes; 4) Proponer pequeñas pruebas de una semana; 5) Acordar medición o registro; 6) Revisar y ajustar. Mantén el tono experimental: la astrología aquí funciona como vocabulario compartido para ensayar cambios, no como sentencia inmutable.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-de-reflexion",
        text: "Preguntas de reflexión",
      },
      {
        type: "paragraph",
        text: "Preguntas para meditar juntos: ¿Qué elemento domina nuestras reacciones en conflicto? ¿Cuándo preferimos iniciar y cuándo necesitamos espacio? ¿Qué acuerdos concretos podríamos probar la próxima semana? ¿Cómo sabremos si la prueba fue útil? Contesten con ejemplos y fechas; las respuestas serán la base para que la lectura simbólica genere cambios reales y verificables en la convivencia.",
      },
      {
        type: "heading",
        level: 2,
        id: "disclaimer",
        text: "Disclaimer",
      },
      {
        type: "paragraph",
        text: "Disclaimer: Este artículo presenta la astrología como herramienta simbólica y reflexiva para conversar y experimentar en pareja o equipos; no ofrece predicciones científicas ni orientaciones médicas, legales o financieras. Las prácticas sugeridas buscan facilitar acuerdos y observación, no reemplazar consejos profesionales. Si enfrentas conflictos complejos, considera la ayuda de mediadores o especialistas acreditados. La responsabilidad sobre acuerdos concretos corresponde a las personas involucradas.",
      },
    ],
    seo: {
      title: "Elementos, ritmos y acuerdos: una lectura práctica de dos signos | Creovision",
      description:
        "Leer dos cartas natales, o dos cartas simbólicas de signos, implica mirar elementos, ritmos y cómo se traducen en acuerdos. Este enfoque práctico considera que los elementos (fuego, tierra, aire, agua) ofrecen cualidades",
      og_title: "Elementos, ritmos y acuerdos: una lectura práctica de dos signos",
      og_description:
        "Leer dos cartas natales, o dos cartas simbólicas de signos, implica mirar elementos, ritmos y cómo se traducen en acuerdos. Este enfoque práctico considera que los elementos (fuego, tierra, aire, agua) ofrecen cualidades",
    },
    tags: ["compatibilidad", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-como-leer-un-horoscopo-diario-con-criterio-y-contexto",
    slug: "como-leer-un-horoscopo-diario-con-criterio-y-contexto",
    title: "Cómo leer un horóscopo diario con criterio y contexto",
    subtitle:
      "Un horóscopo diario es una invitación a pensar, no una sentencia. Leerlo con criterio implica distinguir entre lenguaje simbólico, generalizaciones y ",
    excerpt:
      "Un horóscopo diario es una invitación a pensar, no una sentencia. Leerlo con criterio implica distinguir entre lenguaje simbólico, generalizaciones y recomendaciones prácticas. Este texto propone herramientas para situar",
    categoryId: "local-category-horoscope",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "paragraph",
        text: "Un horóscopo diario es una invitación a pensar, no una sentencia. Leerlo con criterio implica distinguir entre lenguaje simbólico, generalizaciones y recomendaciones prácticas. Este texto propone herramientas para situar cada lectura en su contexto: conocer la fuente, comparar con los ciclos astronómicos relevantes, y decidir qué parte resuena contigo. La intención es ayudarte a aprovechar la guía simbológica sin perder la responsabilidad sobre tus decisiones.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-1-averigua-quien-escribe-y-como",
        text: "Sección práctica 1 — Averigua quién escribe y cómo",
      },
      {
        type: "paragraph",
        text: "Antes de tomar en serio una predicción, revisa la metodología del autor: ¿trabaja con signo solar, con carta natal completa o con tránsitos específicos? Un horóscopo redactado para el signo solar ofrece panoramas generales; uno basado en la carta natal puede ser más matizado. Verifica si el autor explica sus criterios y fuentes; la transparencia ayuda a valorar la utilidad de cada lectura y a calibrar cuánto aplicar a tu situación personal.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-2-situa-el-horoscopo-en-ciclos-reales",
        text: "Sección práctica 2 — Sitúa el horóscopo en ciclos reales",
      },
      {
        type: "paragraph",
        text: "Relacionar la lectura con ciclos como fases lunares o tránsitos planetarios aporta contexto. La Luna, por ejemplo, cambia de fase y su energía percibida varía día a día; reconocer una Luna nueva o llena puede explicar sensaciones colectivas o personales. Consultar guías fiables sobre fases y movimientos te permite diferenciar entre un consejo basado en ritmo astrológico y una generalización sin anclaje observacional.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-3-interpreta-simbolos-como-herramientas-no-certezas",
        text: "Sección práctica 3 — Interpreta símbolos como herramientas, no certezas",
      },
      {
        type: "paragraph",
        text: "Las imágenes astrológicas funcionan como metáforas para aspectos psicológicos y sociales; hablar de ‘Mercurio retrógrado’ o de ‘un tránsito desafiante’ es señalar temas posibles, no describir el destino. Usa los símbolos para reflexionar sobre patrones, emociones y decisiones: ¿qué te sugiere una imagen sobre tu comunicación, tu energía o tus límites? Mantén la lectura como un espejo simbólico que ofrece opciones, no instrucciones inapelables.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-4-aplica-lo-util-y-deja-lo-que-confunde",
        text: "Sección práctica 4 — Aplica lo útil y deja lo que confunde",
      },
      {
        type: "paragraph",
        text: "Tras leer, selecciona una o dos ideas accionables: una intención diaria, un pequeño cambio de hábito o una frase para reflexionar. Evita que el horóscopo determine decisiones críticas (salud, finanzas, situaciones legales); para esos temas, consulta especialistas. Llevar un registro por unas semanas te ayudará a detectar qué tipo de lenguaje te sirve: ¿prefieres metáforas cortas, sugerencias prácticas o análisis más extensos?",
      },
      {
        type: "heading",
        level: 2,
        id: "chequeo-rapido-antes-de-leer-un-horoscopo",
        text: "Chequeo rápido antes de leer un horóscopo",
      },
      {
        type: "paragraph",
        text: "Haz este pequeño filtro cada vez que leas un horóscopo para mantener perspectiva y criterio.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-para-tu-reflexion",
        text: "Preguntas para tu reflexión",
      },
      {
        type: "paragraph",
        text: "¿Qué parte del horóscopo te estimuló una emoción inmediata?; ¿Cómo puedes convertir una sugerencia simbólica en una acción concreta y pequeña hoy?; ¿Hay un patrón repetido en varios horóscopos que merece exploración personal?; ¿Qué límites personales necesitas poner para que una lectura te acompañe sin reemplazar tu juicio?",
      },
      {
        type: "heading",
        level: 2,
        id: "disclaimer",
        text: "Disclaimer",
      },
      {
        type: "paragraph",
        text: "Los horóscopos y la astrología se presentan aquí como lenguajes simbólicos para la reflexión personal. No son diagnósticos ni sustitutos de asesoría profesional en salud, legal o financiera. Usa la información como herramienta de autoconocimiento y, cuando corresponda, consulta a especialistas cualificados para decisiones importantes.",
      },
    ],
    seo: {
      title: "Cómo leer un horóscopo diario con criterio y contexto | Creovision",
      description:
        "Un horóscopo diario es una invitación a pensar, no una sentencia. Leerlo con criterio implica distinguir entre lenguaje simbólico, generalizaciones y recomendaciones prácticas. Este texto propone herramientas para situar",
      og_title: "Cómo leer un horóscopo diario con criterio y contexto",
      og_description:
        "Un horóscopo diario es una invitación a pensar, no una sentencia. Leerlo con criterio implica distinguir entre lenguaje simbólico, generalizaciones y recomendaciones prácticas. Este texto propone herramientas para situar",
    },
    tags: ["horoscopo", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://science.nasa.gov/moon/moon-phases/",
      },
      {
        label: "Fuente de referencia",
        url: "https://science.nasa.gov/moon/daily-moon-guide/",
      },
      {
        label: "Fuente de referencia",
        url: "https://aa.usno.navy.mil/data/MoonPhases",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-de-la-prediccion-a-la-reflexion-que-hace-util-una-lectura-simbolica",
    slug: "de-la-prediccion-a-la-reflexion-que-hace-util-una-lectura-simbolica",
    title: "De la predicción a la reflexión: qué hace útil una lectura simbólica",
    subtitle:
      "Una lectura simbólica transforma información astrológica o arquetípica en espacios de reflexión. Lejos de prometer certezas, su valor reside en foment",
    excerpt:
      "Una lectura simbólica transforma información astrológica o arquetípica en espacios de reflexión. Lejos de prometer certezas, su valor reside en fomentar preguntas, clarificar percepciones y abrir posibilidades. Este artí",
    categoryId: "local-category-horoscope",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "paragraph",
        text: "Una lectura simbólica transforma información astrológica o arquetípica en espacios de reflexión. Lejos de prometer certezas, su valor reside en fomentar preguntas, clarificar percepciones y abrir posibilidades. Este artículo distingue elementos que convierten una predicción en una herramienta práctica: intencionalidad, simbolismo claro, anclaje personal y uso responsable. Te propongo pasos concretos para que una lectura te aporte significado sin sustituir tu criterio.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-1-clarifica-la-intencion-antes-de-leer",
        text: "Sección práctica 1 — Clarifica la intención antes de leer",
      },
      {
        type: "paragraph",
        text: "Antes de consultar una carta, horóscopo o tirada simbólica, define por qué lo haces: buscar perspectiva sobre una relación, explorar un bloqueo creativo o acompañar el duelo. Una intención orienta la interpretación y ayuda a elegir qué mensajes tomar. Cuando la intención es clara, las imágenes simbólicas actúan como espejos útiles que iluminan aspectos concretos de la experiencia, no como respuestas universales.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-2-traduce-simbolos-a-acciones-pequenas",
        text: "Sección práctica 2 — Traduce símbolos a acciones pequeñas",
      },
      {
        type: "paragraph",
        text: "Un símbolo poderoso se vuelve útil cuando lo conectas con un paso concreto. Si una lectura sugiere ‘revisar límites’, tradúcelo a una acción: decir ‘no’ a un compromiso pequeño o reservar media hora para reflexionar. Esa traducción convierte reflexión en práctica: prueba una acción durante un día y evalúa el efecto. Las pequeñas pruebas mantienen la lectura como herramienta experimental y no como dogma.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-3-contrasta-lecturas-con-tu-experiencia",
        text: "Sección práctica 3 — Contrasta lecturas con tu experiencia",
      },
      {
        type: "paragraph",
        text: "Comparar lo que dice una lectura con lo que estás viviendo permite discernir patrones genuinos. Observa coincidencias, discrepancias y matices: ¿la interpretación resuena con tu estado emocional, tu contexto social o con hechos observables? Ese contraste no valida o invalida la simbología de modo absoluto, pero te ayuda a integrar lo que resulta práctico y a descartar lo que no aporta.",
      },
      {
        type: "heading",
        level: 2,
        id: "seccion-practica-4-usa-tradiciones-simbolicas-con-conocimiento",
        text: "Sección práctica 4 — Usa tradiciones simbólicas con conocimiento",
      },
      {
        type: "paragraph",
        text: "Si empleas recursos como cartas del tarot o arquetipos astrológicos, conviene conocer su historia y sentido básico para evitar lecturas superficiales. Las tradiciones poseen capas: mitos, arcanos y desarrollos modernos que enriquecen la interpretación. Informarte sobre su origen y variantes te permite elegir enfoques coherentes y respetuosos, y evita sostenimientos rígidos que confundan guía con mandato.",
      },
      {
        type: "heading",
        level: 2,
        id: "lista-practica-senales-de-una-lectura-simbolica-util",
        text: "Lista práctica: señales de una lectura simbólica útil",
      },
      {
        type: "paragraph",
        text: "Al realizar una lectura, fíjate en estos indicadores para valorar su utilidad.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-para-seguir-indagando",
        text: "Preguntas para seguir indagando",
      },
      {
        type: "paragraph",
        text: "¿Qué símbolo de la lectura te abrió una nueva perspectiva hoy?; ¿Cuál sería el primer paso pequeño para probar esa idea esta semana?; ¿Qué parte de la lectura rechazas y por qué?; ¿Cómo mantendrás la lectura como ayuda sin dejar que defina todas tus decisiones?",
      },
      {
        type: "heading",
        level: 2,
        id: "disclaimer",
        text: "Disclaimer",
      },
      {
        type: "paragraph",
        text: "Los enfoques simbólicos y las prácticas mencionadas están pensados para la reflexión personal. No constituyen diagnóstico ni alternativa a asesoría profesional en asuntos de salud, legales o financieros. Si necesitas apoyo en áreas críticas, acude a especialistas. La intención aquí es ofrecer herramientas de autoconocimiento y no instrucciones deterministas.",
      },
    ],
    seo: {
      title: "De la predicción a la reflexión: qué hace útil una lectura simbólica | Creovision",
      description:
        "Una lectura simbólica transforma información astrológica o arquetípica en espacios de reflexión. Lejos de prometer certezas, su valor reside en fomentar preguntas, clarificar percepciones y abrir posibilidades. Este artí",
      og_title: "De la predicción a la reflexión: qué hace útil una lectura simbólica",
      og_description:
        "Una lectura simbólica transforma información astrológica o arquetípica en espacios de reflexión. Lejos de prometer certezas, su valor reside en fomentar preguntas, clarificar percepciones y abrir posibilidades. Este artí",
    },
    tags: ["horoscopo", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/tarot",
      },
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/Major-Arcana",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-que-significa-leer-simbolos-con-responsabilidad",
    slug: "que-significa-leer-simbolos-con-responsabilidad",
    title: "Qué significa leer símbolos con responsabilidad",
    subtitle:
      "Leer símbolos es invitar a alguien a un diálogo interior usando imágenes, arquetipos y metáforas. Hacerlo con responsabilidad implica atender al conte",
    excerpt:
      "Leer símbolos es invitar a alguien a un diálogo interior usando imágenes, arquetipos y metáforas. Hacerlo con responsabilidad implica atender al contexto emocional, respetar los límites y recordar que el símbolo abre pos",
    categoryId: "local-category-editorial",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "heading",
        level: 2,
        id: "abrir-el-espacio-con-cuidado",
        text: "Abrir el espacio con cuidado",
      },
      {
        type: "paragraph",
        text: "Leer símbolos es invitar a alguien a un diálogo interior usando imágenes, arquetipos y metáforas. Hacerlo con responsabilidad implica atender al contexto emocional, respetar los límites y recordar que el símbolo abre posibilidades, no sentencia. Una lectura ética protege la dignidad de la persona, clarifica el alcance de lo ofrecido y mantiene la humildad frente a la ambigüedad de lo simbólico.",
      },
      {
        type: "heading",
        level: 2,
        id: "contextualiza-antes-de-interpretar",
        text: "Contextualiza antes de interpretar",
      },
      {
        type: "paragraph",
        text: "Todo símbolo llega cargado de historia personal y cultural. Antes de ofrecer una interpretación, pregunta por el trasfondo de quien consulta: idioma, edad, creencias y situación presente. Esa información permite que tu lectura dialogue con la realidad del consultante y no imponga significados ajenos. La misma carta o tránsito puede resonar distinto según el mapa vital de cada persona.",
      },
      {
        type: "heading",
        level: 2,
        id: "distingue-observacion-de-narracion",
        text: "Distingue observación de narración",
      },
      {
        type: "paragraph",
        text: "Separar lo que ves del relato que construyes es una práctica clave. Describe primero lo observable: colores, figuras, posición o configuración. Luego señala que las asociaciones que propones son una lectura posible, no una verdad única. Este cambio de registro ayuda a que la persona reciba opciones interpretativas sin sentirse dirigida o etiquetada.",
      },
      {
        type: "heading",
        level: 2,
        id: "fomenta-la-autonomia-del-consultante",
        text: "Fomenta la autonomía del consultante",
      },
      {
        type: "paragraph",
        text: "Una lectura responsable potencia la capacidad de decisión de la persona. En lugar de dictar soluciones, plantea preguntas que abran caminos y ofrece alternativas para explorar. Propón ejercicios prácticos o reflexiones para que el consultante pruebe hipótesis en su vida cotidiana. El objetivo es acompañar, no sustituir, la responsabilidad personal.",
      },
      {
        type: "paragraph",
        text: "Consentimiento claro antes de comenzar; mantener confidencialidad; delimitar temas fuera de tu competencia (salud, legales, financieros) y sugerir profesionales adecuados; ser transparente sobre tus métodos y límites; evitar lenguaje alarmista o determinista; ofrecer lecturas como herramientas de reflexión, no como predicciones absolutas.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-para-reflexionar-como-lector-o-lectora",
        text: "Preguntas para reflexionar como lector o lectora",
      },
      {
        type: "paragraph",
        text: "¿Qué supuestos traigo al interpretar este símbolo? ¿He preguntado lo suficiente sobre el contexto de la persona? ¿Estoy ofreciendo posibilidades o imponiendo conclusiones? ¿Esta lectura respeta la autonomía del consultante y sus límites? Responder estas preguntas ayuda a mantener una práctica más ética y más útil.",
      },
      {
        type: "heading",
        level: 2,
        id: "aviso-final",
        text: "Aviso final",
      },
      {
        type: "paragraph",
        text: "El tarot, la astrología y otros sistemas simbólicos son lenguajes de reflexión que invitan a explorar sentidos y posibilidades. No deben usarse para emitir diagnósticos médicos, legales ni financieros ni para prometer resultados concretos. Si surgen dudas que excedan el ámbito simbólico, remite a profesionales especializados. Esta guía busca orientar prácticas responsables y respetuosas.",
      },
    ],
    seo: {
      title: "Qué significa leer símbolos con responsabilidad | Creovision",
      description:
        "Leer símbolos es invitar a alguien a un diálogo interior usando imágenes, arquetipos y metáforas. Hacerlo con responsabilidad implica atender al contexto emocional, respetar los límites y recordar que el símbolo abre pos",
      og_title: "Qué significa leer símbolos con responsabilidad",
      og_description:
        "Leer símbolos es invitar a alguien a un diálogo interior usando imágenes, arquetipos y metáforas. Hacerlo con responsabilidad implica atender al contexto emocional, respetar los límites y recordar que el símbolo abre pos",
    },
    tags: ["editorial", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/tarot",
      },
      {
        label: "Fuente de referencia",
        url: "https://www.britannica.com/topic/Major-Arcana",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
  {
    id: "local-guide-como-distinguir-un-dato-astronomico-de-una-interpretacion",
    slug: "como-distinguir-un-dato-astronomico-de-una-interpretacion",
    title: "Cómo distinguir un dato astronómico de una interpretación",
    subtitle:
      "En observación astronómica conviven dos planos: los datos objetivos —posiciones, tiempos y fenómenos medibles— y las interpretaciones que mostramos a ",
    excerpt:
      "En observación astronómica conviven dos planos: los datos objetivos —posiciones, tiempos y fenómenos medibles— y las interpretaciones que mostramos a esos datos desde marcos culturales o simbólicos. Aprender a distinguir",
    categoryId: "local-category-editorial",
    authorId: "local-author-equipo-editorial",
    status: "published",
    imageUrl: null,
    imageAlt: null,
    content: [
      {
        type: "heading",
        level: 2,
        id: "separar-lo-medible-de-lo-interpretado",
        text: "Separar lo medible de lo interpretado",
      },
      {
        type: "paragraph",
        text: "En observación astronómica conviven dos planos: los datos objetivos —posiciones, tiempos y fenómenos medibles— y las interpretaciones que mostramos a esos datos desde marcos culturales o simbólicos. Aprender a distinguirlos nos permite usar la información con claridad: reconocer qué es verificable y dónde entran las narrativas humanas que dan sentido a esos hechos celestes.",
      },
      {
        type: "heading",
        level: 2,
        id: "identifica-la-fuente-del-dato",
        text: "Identifica la fuente del dato",
      },
      {
        type: "paragraph",
        text: "Un dato fiable viene de un registro o cálculo verificable: observaciones instrumentales, efemérides o servicios científicos. Antes de aceptar una cifra, comprueba la procedencia, la fecha y el método. Instituciones como observatorios y proyectos de efemérides publican información con metadatos. Verificar la fuente reduce errores y aclara si lo que tienes es un valor medible o una interpretación añadida.",
      },
      {
        type: "heading",
        level: 2,
        id: "que-constituye-un-dato-astronomico",
        text: "Qué constituye un dato astronómico",
      },
      {
        type: "paragraph",
        text: "Los datos incluyen posiciones celestes, momentos exactos de fases lunares, distancias y magnitudes medidas por instrumentos o calculadas por ephemerides. Por ejemplo, las fases de la Luna se describen por la geometría relativa de Sol, Tierra y Luna y por el porcentaje de iluminación observable en un instante. Ese tipo de información es reproducible y se documenta en tablas y algoritmos.",
      },
      {
        type: "heading",
        level: 2,
        id: "reconocer-las-interpretaciones",
        text: "Reconocer las interpretaciones",
      },
      {
        type: "paragraph",
        text: "Las interpretaciones agregan significado humano: historiales culturales, astrología o lecturas simbólicas que no son mediciones. Estas narrativas pueden ser valiosas como marco reflexivo, pero no deben confundirse con evidencia empírica. Señala claramente cuándo pasas de describir un hecho verificable a ofrecer una interpretación, y evita presentar hipótesis como certezas científicas.",
      },
      {
        type: "heading",
        level: 2,
        id: "como-verificar-datos-por-tu-cuenta",
        text: "Cómo verificar datos por tu cuenta",
      },
      {
        type: "paragraph",
        text: "Para comprobar datos consulta servicios reconocidos: tablas de fases, efemérides y librerías de cálculo astronómico. Contrasta dos o más fuentes y revisa el tiempo y la ubicación usados en el cálculo. Herramientas de código abierto o bases oficiales permiten reproducir resultados y detectar discrepancias. La verificación empodera el uso responsable de la información astronómica ante cualquier interpretación.",
      },
      {
        type: "paragraph",
        text: "¿Proviene de una medición o cálculo verificable?; ¿se especificó tiempo y lugar?; ¿la fuente es un observatorio, efeméride o librería técnica?; ¿la afirmación usa lenguaje simbólico o probabilístico?; ¿se presentan alternativas interpretativas o sólo una conclusión? Esta lista ayuda a decidir si lo que tienes es dato o narrativa.",
      },
      {
        type: "heading",
        level: 2,
        id: "preguntas-para-tu-practica-y-lectura",
        text: "Preguntas para tu práctica y lectura",
      },
      {
        type: "paragraph",
        text: "¿Qué fuentes confío para datos astronómicos y por qué? ¿Cómo dejo claro a otras personas cuándo ofrezco una medida y cuándo propongo una interpretación? ¿En qué contextos es apropiado usar datos como respaldo y cuándo basta con una lectura simbólica? Reflexionar sobre esto mejora la honestidad intelectual y la calidad de las explicaciones.",
      },
      {
        type: "heading",
        level: 2,
        id: "aviso-sobre-el-uso-de-la-informacion",
        text: "Aviso sobre el uso de la información",
      },
      {
        type: "paragraph",
        text: "La información astronómica citada aquí se refiere a conceptos y buenas prácticas para distinguir mediciones de interpretaciones simbólicas. No se ofrecen diagnósticos, instrucciones médicas, legales o financieras. Para datos técnicos concretos o decisiones específicas consulta las fuentes científicas y a profesionales competentes. Esta guía busca clarificar criterios, no sustituir asesorías especializadas.",
      },
    ],
    seo: {
      title: "Cómo distinguir un dato astronómico de una interpretación | Creovision",
      description:
        "En observación astronómica conviven dos planos: los datos objetivos —posiciones, tiempos y fenómenos medibles— y las interpretaciones que mostramos a esos datos desde marcos culturales o simbólicos. Aprender a distinguir",
      og_title: "Cómo distinguir un dato astronómico de una interpretación",
      og_description:
        "En observación astronómica conviven dos planos: los datos objetivos —posiciones, tiempos y fenómenos medibles— y las interpretaciones que mostramos a esos datos desde marcos culturales o simbólicos. Aprender a distinguir",
    },
    tags: ["editorial", "guía", "reflexión"],
    readingTime: 4,
    featured: true,
    homeFeatured: true,
    sources: [
      {
        label: "Fuente de referencia",
        url: "https://science.nasa.gov/moon/moon-phases/",
      },
      {
        label: "Fuente de referencia",
        url: "https://science.nasa.gov/moon/daily-moon-guide/",
      },
      {
        label: "Fuente de referencia",
        url: "https://aa.usno.navy.mil/data/MoonPhases",
      },
      {
        label: "Fuente de referencia",
        url: "https://github.com/cosinekitty/astronomy",
      },
      {
        label: "Fuente de referencia",
        url: "https://www.astro.com/swisseph/swisseph.htm?nhor",
      },
    ],
    relatedArticleIds: [],
    disclaimerKey: "general",
    reviewedBy: "Equipo editorial",
    reviewDate: "2026-08-27",
    canonicalOverride: null,
    isDemo: false,
    publishedAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
];
