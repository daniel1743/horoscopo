import type { LifePathNumber, LifePathProfile } from "@/types/numerology";

export const lifePathProfiles: Record<LifePathNumber, LifePathProfile> = {
  1: {
    label: "Iniciativa y autonomía",
    keywords: ["iniciativa", "dirección", "autonomía"],
    summary:
      "En esta lectura simbólica, el 1 pone el foco en iniciar, elegir una dirección y desarrollar una voz propia sin aislarse de quienes acompañan el proceso.",
    practice:
      "Elige una acción pequeña que dependa de ti y define qué apoyo necesitas para sostenerla.",
    reflectionQuestion: "¿Dónde puedes tomar la iniciativa sin tener que hacerlo todo a solas?",
  },
  2: {
    label: "Cooperación y escucha",
    keywords: ["escucha", "acuerdo", "sensibilidad"],
    summary:
      "El 2 se asocia aquí con la escucha, la cooperación y la capacidad de percibir matices en los vínculos, cuidando que adaptarte no signifique borrarte.",
    practice:
      "Antes de responder en una conversación importante, nombra lo que entendiste y después expresa con claridad tu propia necesidad.",
    reflectionQuestion: "¿Qué acuerdo sería más honesto si también incluyera tu propia voz?",
  },
  3: {
    label: "Expresión y creatividad",
    keywords: ["expresión", "creatividad", "comunicación"],
    summary:
      "El 3 funciona como un símbolo de expresión, humor y creatividad compartida: ideas que ganan fuerza cuando encuentran una forma concreta de salir al mundo.",
    practice:
      "Convierte una idea pendiente en un borrador breve, una conversación o una imagen que puedas revisar después.",
    reflectionQuestion: "¿Qué quieres expresar aunque todavía no esté perfecto?",
  },
  4: {
    label: "Estructura y constancia",
    keywords: ["estructura", "disciplina", "base"],
    summary:
      "El 4 enfatiza construir bases, ordenar recursos y avanzar con constancia. La estructura es útil cuando sostiene el propósito, no cuando se vuelve rigidez.",
    practice:
      "Define un siguiente paso de menos de treinta minutos y ponle un lugar concreto en tu día.",
    reflectionQuestion: "¿Qué estructura sencilla haría más sostenible lo que quieres cuidar?",
  },
  5: {
    label: "Cambio y exploración",
    keywords: ["cambio", "curiosidad", "movimiento"],
    summary:
      "El 5 se lee como una invitación a explorar, aprender y adaptarse. La libertad gana profundidad cuando se acompaña de límites elegidos conscientemente.",
    practice:
      "Prueba una variación pequeña en tu rutina y observa qué información te ofrece antes de cambiarlo todo.",
    reflectionQuestion: "¿Qué cambio te devolvería curiosidad sin poner en riesgo lo esencial?",
  },
  6: {
    label: "Cuidado y responsabilidad",
    keywords: ["cuidado", "responsabilidad", "armonía"],
    summary:
      "El 6 pone en primer plano el cuidado, la responsabilidad y el sentido de hogar. También recuerda revisar si estás asumiendo cargas que deberían repartirse.",
    practice:
      "Haz una lista de lo que sostienes y separa lo que te corresponde de lo que puedes pedir o delegar.",
    reflectionQuestion: "¿Cómo puedes cuidar sin convertirte en la única persona responsable?",
  },
  7: {
    label: "Búsqueda y profundidad",
    keywords: ["búsqueda", "análisis", "interioridad"],
    summary:
      "El 7 simboliza la búsqueda de sentido, la observación y el tiempo de interioridad. Su práctica es unir reflexión con una forma verificable de volver a la experiencia.",
    practice:
      "Escribe una pregunta y contrástala con un hecho, una conversación o una observación antes de sacar conclusiones.",
    reflectionQuestion: "¿Qué necesitas observar con más calma antes de decidir qué significa?",
  },
  8: {
    label: "Gestión y propósito",
    keywords: ["gestión", "recursos", "logro"],
    summary:
      "El 8 se presenta como un símbolo de gestión de recursos, ambición y resultados. La lectura invita a equilibrar eficacia con responsabilidad y límites claros.",
    practice:
      "Define qué significa un resultado suficiente y qué criterio usarás para evaluar el avance sin reducirlo todo al rendimiento.",
    reflectionQuestion:
      "¿Qué relación quieres construir con tus recursos y tu capacidad de influencia?",
  },
  9: {
    label: "Cierre y perspectiva",
    keywords: ["cierre", "empatía", "perspectiva"],
    summary:
      "El 9 se asocia con integrar aprendizajes, cerrar ciclos y ampliar la perspectiva. Soltar también puede ser una forma responsable de hacer espacio.",
    practice:
      "Nombra un ciclo que terminó, qué aprendiste y qué límite necesitas para no repetirlo por inercia.",
    reflectionQuestion: "¿Qué puedes cerrar con gratitud para recuperar espacio y perspectiva?",
  },
  11: {
    label: "Intuición y visión",
    keywords: ["intuición", "visión", "inspiración"],
    summary:
      "El 11 se conserva como número maestro en este método y simboliza intuición, sensibilidad y visión. Conviene traducir cualquier inspiración en pasos observables.",
    practice:
      "Registra una intuición y conviértela en una hipótesis pequeña que puedas observar, no en una certeza sobre el futuro.",
    reflectionQuestion:
      "¿Qué visión merece una prueba concreta antes de convertirse en una expectativa?",
  },
  22: {
    label: "Construcción y alcance",
    keywords: ["construcción", "visión", "servicio"],
    summary:
      "El 22 se conserva como número maestro y se lee como la tensión fértil entre una visión amplia y la construcción paciente de algo útil y compartido.",
    practice:
      "Divide una aspiración grande en un entregable concreto que pueda ayudar a alguien en el presente.",
    reflectionQuestion: "¿Qué parte de tu visión puede convertirse hoy en una base realista?",
  },
  33: {
    label: "Enseñanza y compasión",
    keywords: ["enseñanza", "compasión", "servicio"],
    summary:
      "El 33 se conserva como número maestro y se interpreta como aprendizaje, cuidado y enseñanza. La compasión también necesita límites para ser sostenible.",
    practice:
      "Comparte una herramienta que te haya servido, dejando claro que cada persona puede adaptarla o descartarla.",
    reflectionQuestion: "¿Cómo puedes acompañar sin asumir que sabes qué necesita la otra persona?",
  },
};

export const numerologyDisclaimer =
  "La numerología es una práctica simbólica y cultural. Este resultado no predice hechos ni sustituye orientación médica, psicológica, legal o financiera.";
