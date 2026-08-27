import type { DreamSymbol, DreamTheme } from "@/types/dreams";

export const dreamThemeLabels: Record<DreamTheme, string> = {
  emotions: "Emociones",
  movement: "Movimiento",
  nature: "Naturaleza",
  relationships: "Relaciones",
  objects: "Objetos y lugares",
};

export const dreamSymbols: readonly DreamSymbol[] = [
  {
    slug: "agua",
    name: "Agua",
    theme: "nature",
    shortDescription:
      "Un símbolo frecuente para hablar de fluidez, profundidad o cambio emocional.",
    symbolicLens:
      "Puede invitar a observar cómo te relacionas con lo incierto y con lo que no controlas.",
    emotionalLens:
      "El estado del agua en el sueño puede resonar con calma, agitación, miedo o alivio.",
    reflectionQuestion: "¿Qué emoción estaba moviéndose en mí y qué necesitaba ser escuchado?",
    relatedWords: ["mar", "río", "lluvia", "nadar", "ola"],
  },
  {
    slug: "volar",
    name: "Volar",
    theme: "movement",
    shortDescription:
      "Una imagen asociada a perspectiva, libertad, deseo de distancia o pérdida de apoyo.",
    symbolicLens:
      "Puede representar la necesidad de mirar un asunto desde otro ángulo, sin asumir que anuncia un hecho.",
    emotionalLens:
      "La ligereza puede sentirse como libertad; la caída o el miedo pueden señalar vulnerabilidad presente.",
    reflectionQuestion: "¿Qué distancia o perspectiva necesito para comprender mejor mi situación?",
    relatedWords: ["cielo", "alas", "altura", "caer", "libertad"],
  },
  {
    slug: "caer",
    name: "Caer",
    theme: "movement",
    shortDescription:
      "Una experiencia intensa que puede conectar con inseguridad, transición o falta de control.",
    symbolicLens: "Puede servir para revisar qué soporte, límite o decisión se siente inestable.",
    emotionalLens:
      "La sensación corporal suele ser tan importante como la escena: alarma, vértigo, sorpresa o descanso.",
    reflectionQuestion: "¿En qué área de mi vida necesito más apoyo o un límite más claro?",
    relatedWords: ["abismo", "altura", "suelo", "peligro", "despertar"],
  },
  {
    slug: "casa",
    name: "Casa",
    theme: "objects",
    shortDescription:
      "Un espacio que puede reflejar intimidad, memoria, pertenencia o cambios internos.",
    symbolicLens:
      "Las habitaciones pueden abrir una conversación sobre partes de tu vida que reciben atención o quedan apartadas.",
    emotionalLens:
      "Una casa segura, desconocida o en ruinas puede evocar sensaciones distintas en cada persona.",
    reflectionQuestion: "¿Qué espacio de mi vida se siente habitable y cuál necesita cuidado?",
    relatedWords: ["habitación", "puerta", "familia", "hogar", "mudanza"],
  },
  {
    slug: "puerta",
    name: "Puerta",
    theme: "objects",
    shortDescription: "Una imagen de umbral, elección, límite o acceso a una experiencia nueva.",
    symbolicLens:
      "Puede ayudarte a nombrar una posibilidad que estás considerando, sin decirte qué debes hacer.",
    emotionalLens:
      "Abrir, cerrar o no encontrar la llave cambia la sensación de disponibilidad, temor o autonomía.",
    reflectionQuestion: "¿Qué posibilidad estoy dejando entrar y qué límite necesito respetar?",
    relatedWords: ["llave", "umbral", "entrada", "salir", "cerrar"],
  },
  {
    slug: "camino",
    name: "Camino",
    theme: "movement",
    shortDescription:
      "Un recorrido que puede conectar con dirección, proceso, decisión o incertidumbre.",
    symbolicLens:
      "Puede ser una forma de ordenar los pasos que ya has dado y los que todavía estás evaluando.",
    emotionalLens:
      "El camino puede sentirse claro, agotador, solitario o acompañado según tu momento vital.",
    reflectionQuestion: "¿Cuál es el próximo paso pequeño que sí puedo elegir hoy?",
    relatedWords: ["viaje", "sendero", "mapa", "destino", "cruce"],
  },
  {
    slug: "bosque",
    name: "Bosque",
    theme: "nature",
    shortDescription:
      "Un entorno que puede evocar exploración, misterio, refugio o contacto con lo desconocido.",
    symbolicLens:
      "Puede abrir una reflexión sobre una parte de tu experiencia que aún no tiene un mapa claro.",
    emotionalLens:
      "La densidad del bosque y la compañía presente pueden cambiar entre curiosidad, calma y desorientación.",
    reflectionQuestion:
      "¿Qué parte de mí estoy explorando sin exigirme tener todas las respuestas?",
    relatedWords: ["árbol", "sendero", "oscuridad", "naturaleza", "refugio"],
  },
  {
    slug: "tormenta",
    name: "Tormenta",
    theme: "emotions",
    shortDescription:
      "Una escena de intensidad que puede acompañar periodos de tensión, descarga o transformación.",
    symbolicLens:
      "Puede ayudarte a identificar qué conflicto necesita espacio, conversación o descanso.",
    emotionalLens:
      "El miedo, la energía o el alivio después de la tormenta importan más que una interpretación universal.",
    reflectionQuestion: "¿Qué intensidad estoy atravesando y qué me ayudaría a recuperar calma?",
    relatedWords: ["trueno", "relámpago", "lluvia", "viento", "calma"],
  },
  {
    slug: "fuego",
    name: "Fuego",
    theme: "emotions",
    shortDescription: "Un símbolo de energía, deseo, transformación, riesgo o renovación.",
    symbolicLens:
      "Puede invitar a distinguir entre una motivación viva y algo que necesita límites antes de crecer.",
    emotionalLens:
      "El fuego puede sentirse cálido, creativo, amenazante o purificador según la experiencia del sueño.",
    reflectionQuestion: "¿Qué energía quiero cuidar y cuál necesita una frontera más segura?",
    relatedWords: ["llama", "humo", "calor", "ceniza", "luz"],
  },
  {
    slug: "animales",
    name: "Animales",
    theme: "nature",
    shortDescription:
      "Presencias que pueden conectar con instinto, cuidado, miedo o cualidades que reconoces en ti.",
    symbolicLens:
      "La especie no tiene un significado único: la relación que tienes con ella ofrece más contexto.",
    emotionalLens:
      "Observa si el animal despertaba ternura, respeto, amenaza, curiosidad o necesidad de proteger.",
    reflectionQuestion: "¿Qué cualidad o necesidad representa para mí ese animal en este momento?",
    relatedWords: ["perro", "gato", "pájaro", "serpiente", "caballo"],
  },
  {
    slug: "dientes",
    name: "Dientes",
    theme: "emotions",
    shortDescription:
      "Una imagen corporal que puede acompañar preocupaciones sobre expresión, cambio o vulnerabilidad.",
    symbolicLens:
      "Puede abrir una conversación sobre lo que quieres decir, mostrar o conservar bajo control.",
    emotionalLens:
      "Vergüenza, dolor, pérdida o alivio son pistas personales; no significan una condición médica.",
    reflectionQuestion: "¿Qué me cuesta expresar o qué cambio de mi imagen estoy procesando?",
    relatedWords: ["boca", "sonreír", "pérdida", "dolor", "hablar"],
  },
  {
    slug: "persecucion",
    name: "Persecución",
    theme: "emotions",
    shortDescription:
      "Una escena de presión que puede reflejar evitación, conflicto o sensación de amenaza.",
    symbolicLens:
      "Puede ayudarte a ubicar algo que estás postergando, sin concluir que exista un peligro literal.",
    emotionalLens:
      "El perseguidor, el lugar y la posibilidad de pedir ayuda pueden mostrar cómo vives la presión.",
    reflectionQuestion: "¿Qué situación estoy evitando mirar y qué apoyo podría pedir?",
    relatedWords: ["correr", "escapar", "miedo", "amenaza", "ayuda"],
  },
  {
    slug: "desnudez",
    name: "Desnudez",
    theme: "relationships",
    shortDescription:
      "Una experiencia que puede relacionarse con exposición, autenticidad, vergüenza o libertad.",
    symbolicLens:
      "Puede invitar a revisar dónde sientes que te ven sin suficiente protección o dónde deseas ser más auténtico.",
    emotionalLens:
      "La emoción —incomodidad, tranquilidad, orgullo o miedo— orienta más que la escena aislada.",
    reflectionQuestion:
      "¿Dónde necesito más intimidad, seguridad o permiso para mostrarme como soy?",
    relatedWords: ["ropa", "exposición", "vergüenza", "intimidad", "cuerpo"],
  },
  {
    slug: "escuela",
    name: "Escuela",
    theme: "objects",
    shortDescription:
      "Un entorno que puede activar aprendizajes, evaluación, comparación o recuerdos de etapas anteriores.",
    symbolicLens:
      "Puede ayudarte a reconocer qué lección actual se parece a una experiencia pasada.",
    emotionalLens:
      "El examen, el aula o la presencia de compañeros pueden evocar presión, curiosidad o pertenencia.",
    reflectionQuestion: "¿Qué estoy aprendiendo ahora y qué exigencia ya no necesito repetir?",
    relatedWords: ["examen", "clase", "maestro", "tarea", "nota"],
  },
  {
    slug: "viaje",
    name: "Viaje",
    theme: "movement",
    shortDescription:
      "Una transición que puede representar cambio de etapa, preparación o deseo de explorar.",
    symbolicLens:
      "Puede servir para observar qué llevas contigo y qué estás listo para dejar atrás.",
    emotionalLens:
      "La prisa, el equipaje y el destino desconocido aportan pistas sobre tu relación con el cambio.",
    reflectionQuestion:
      "¿Qué necesito preparar para avanzar sin llevar una carga que ya no me corresponde?",
    relatedWords: ["maleta", "tren", "avión", "destino", "regreso"],
  },
  {
    slug: "reloj",
    name: "Reloj",
    theme: "objects",
    shortDescription:
      "Una imagen de tiempo, urgencia, espera o conciencia de una etapa que está cambiando.",
    symbolicLens:
      "Puede invitar a distinguir entre un plazo real y una presión que te estás imponiendo.",
    emotionalLens:
      "Mirar la hora, perderla o verla detenida puede resonar con ansiedad, paciencia o deseo de pausa.",
    reflectionQuestion: "¿Qué plazo es real y dónde necesito permitirme otro ritmo?",
    relatedWords: ["hora", "tiempo", "espera", "retraso", "calendario"],
  },
  {
    slug: "persona-fallecida",
    name: "Persona fallecida",
    theme: "relationships",
    shortDescription:
      "Un encuentro onírico que puede acompañar duelo, memoria, afecto o asuntos emocionales pendientes.",
    symbolicLens:
      "No implica un mensaje sobrenatural: puede ser una forma de elaborar recuerdos y vínculos significativos.",
    emotionalLens:
      "La conversación, el tono y lo que sentiste al despertar merecen un cuidado personal y sin juicios.",
    reflectionQuestion:
      "¿Qué recuerdo, valor o emoción de esa relación necesita hoy un espacio amable?",
    relatedWords: ["duelo", "memoria", "familia", "despedida", "nostalgia"],
  },
  {
    slug: "bebe",
    name: "Bebé",
    theme: "relationships",
    shortDescription:
      "Una imagen que puede acompañar comienzos, cuidado, vulnerabilidad o una parte nueva de ti.",
    symbolicLens:
      "Puede ayudar a nombrar algo que está naciendo y necesita tiempo, protección y atención.",
    emotionalLens:
      "La ternura, el miedo o la responsabilidad percibida hablan de tu relación con ese comienzo.",
    reflectionQuestion: "¿Qué proyecto, vínculo o parte de mí necesita cuidado paciente?",
    relatedWords: ["nacimiento", "cuidado", "familia", "comienzo", "protección"],
  },
  {
    slug: "llaves",
    name: "Llaves",
    theme: "objects",
    shortDescription:
      "Un objeto de acceso que puede hablar de soluciones, permiso, control o límites.",
    symbolicLens:
      "Puede invitar a revisar qué recurso ya tienes y qué puerta no necesita ser forzada.",
    emotionalLens:
      "Encontrar, perder o entregar una llave puede evocar seguridad, frustración, confianza o autonomía.",
    reflectionQuestion: "¿Qué recurso tengo disponible y qué acceso necesito negociar con cuidado?",
    relatedWords: ["puerta", "casa", "acceso", "cerradura", "secreto"],
  },
  {
    slug: "espejo",
    name: "Espejo",
    theme: "relationships",
    shortDescription:
      "Una imagen de identidad, autoobservación, percepción y relación con la propia apariencia.",
    symbolicLens:
      "Puede abrir una pregunta sobre la diferencia entre cómo te ves y cómo crees que te ven.",
    emotionalLens:
      "El reflejo claro, cambiado o ausente puede sentirse como reconocimiento, extrañeza o inseguridad.",
    reflectionQuestion:
      "¿Qué parte de mí estoy mirando con honestidad y cuál con demasiada dureza?",
    relatedWords: ["reflejo", "imagen", "rostro", "identidad", "mirar"],
  },
  {
    slug: "luz",
    name: "Luz",
    theme: "nature",
    shortDescription:
      "Una señal de claridad, atención, esperanza o exposición dentro de una escena onírica.",
    symbolicLens:
      "Puede invitar a identificar qué información o verdad estás listo para mirar con calma.",
    emotionalLens:
      "Una luz cálida puede acompañar alivio; una luz intensa puede sentirse como exigencia o exposición.",
    reflectionQuestion:
      "¿Qué estoy comprendiendo con más claridad y cómo puedo sostenerlo sin apresurarme?",
    relatedWords: ["sol", "lámpara", "amanecer", "brillo", "oscuridad"],
  },
  {
    slug: "oscuridad",
    name: "Oscuridad",
    theme: "emotions",
    shortDescription:
      "Un ambiente de incertidumbre, descanso, protección o aspectos todavía no reconocidos.",
    symbolicLens:
      "No representa automáticamente algo negativo: puede señalar pausa, privacidad o falta de información.",
    emotionalLens:
      "El miedo, la tranquilidad o la curiosidad ante lo oscuro cambian por completo el sentido personal.",
    reflectionQuestion:
      "¿Qué no necesito resolver todavía y qué información me ayudaría a sentirme seguro?",
    relatedWords: ["noche", "sombra", "silencio", "miedo", "descanso"],
  },
];
