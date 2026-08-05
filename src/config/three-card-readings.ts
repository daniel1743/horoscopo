/**
 * Configuración central y tipada para tiradas de tres cartas temáticas.
 * Fuente única: Amor, General, Trabajo, Decisión comparten UI, lógica, selección y API.
 * Solo varía la configuración editorial y el foco de interpretación.
 */

import type { ThreeCardReadingConfig, ThreeCardReadingSlug } from "@/types/tarot";

export const threeCardReadings: Record<ThreeCardReadingSlug, ThreeCardReadingConfig> = {
  amor: {
    slug: "amor",
    title: "Tres cartas — Amor",
    shortTitle: "Amor",
    description:
      "Explora tu situación afectiva desde tres perspectivas: lo que llevas emocionalmente, la dinámica actual y la orientación que puede ayudarte a avanzar.",
    intro:
      "Piensa en una situación amorosa concreta. No necesitas escribir nombres ni datos privados. Puedes describir brevemente qué deseas comprender.",
    userContextLabel: "Tu situación amorosa",
    userContextPlaceholder:
      "Ejemplo: Estoy conociendo a alguien y quiero comprender qué debo observar antes de avanzar.",
    positions: [
      {
        key: "emotional_world",
        label: "Tu mundo emocional",
        shortLabel: "Tu emoción",
        displayOrder: 1,
        description:
          "Lo que sientes, necesitas o llevas internamente a esta situación.",
        interpretationFocus:
          "Interpretar la carta desde emociones, necesidades, expectativas, valores y disposición afectiva del usuario. No afirmar hechos sobre terceros.",
      },
      {
        key: "relationship_dynamic",
        label: "La dinámica afectiva",
        shortLabel: "La dinámica",
        displayOrder: 2,
        description:
          "El patrón, tensión o energía que caracteriza actualmente el vínculo o la situación amorosa.",
        interpretationFocus:
          "Describir la dinámica simbólica sin leer la mente de otra persona, sin afirmar sentimientos ajenos como hechos y sin diagnosticar la relación.",
      },
      {
        key: "guidance_forward",
        label: "Orientación para avanzar",
        shortLabel: "Orientación",
        displayOrder: 3,
        description:
          "Lo que conviene comprender, cuidar, expresar o considerar antes de actuar.",
        interpretationFocus:
          "Ofrecer una orientación práctica y reflexiva, sin ordenar terminar, reconciliarse, insistir ni tomar decisiones por el usuario.",
      },
    ] as const,
    synthesisInstructions:
      "Integrar las tres cartas como una lectura coherente. Identificar el patrón emocional principal, la relación entre las posiciones, una posible tensión o recurso, una orientación práctica y una pregunta de reflexión. No limitarse a resumir tres significados independientes.",
    seo: {
      title: "Tirada de Tarot del Amor de 3 cartas | Creovision",
      description:
        "Explora tu situación amorosa con una tirada de tres cartas enfocada en tu mundo emocional, la dinámica afectiva y una orientación para avanzar.",
      canonical: "/tarot/tres-cartas/amor",
    },
    access: "free",
    enabled: true,
  },

  general: {
    slug: "general",
    title: "Tres cartas — Lectura general",
    shortTitle: "General",
    description:
      "Una lectura de tres perspectivas: lo que pasó, lo que está sucediendo ahora y la tendencia futura. Una forma simple de observar tu situación desde múltiples ángulos.",
    intro:
      "Piensa en una situación o pregunta abierta. No necesitas detalle; una frase basta. Puedes preguntar sobre vida, trabajo, relaciones o cualquier aspecto que te interese reflexionar.",
    userContextLabel: "Tu pregunta o situación",
    userContextPlaceholder: "Ejemplo: ¿Cómo está evolucionando mi situación actual?",
    positions: [
      {
        key: "past",
        label: "Pasado",
        shortLabel: "Pasado",
        displayOrder: 1,
        description: "Lo que ha influido o lo que llevaste a este punto.",
        interpretationFocus:
          "Contexto y raíces. Qué enseñanzas o patrones han traído a la persona hasta aquí.",
      },
      {
        key: "present",
        label: "Presente",
        shortLabel: "Presente",
        displayOrder: 2,
        description: "La energía, el estado o los recursos disponibles ahora.",
        interpretationFocus:
          "Lo que está vivo en este momento. Fuerzas, desafíos, oportunidades actuales.",
      },
      {
        key: "future",
        label: "Tendencia futura",
        shortLabel: "Futuro",
        displayOrder: 3,
        description:
          "La orientación o posible evolución si las cosas continúan así.",
        interpretationFocus:
          "No predecir certezas. Mostrar una tendencia, un potencial o lo que podría florecer si se cultiva.",
      },
    ] as const,
    synthesisInstructions:
      "Conectar las tres temporalidades como una narrativa. Mostrar cómo el pasado y presente crean la base para el futuro. Identificar qué se está transformando y qué orientación propone el conjunto.",
    seo: {
      title: "Tirada de Tarot General de 3 cartas | Creovision",
      description:
        "Una lectura de tres perspectivas: pasado, presente y tendencia futura. Una forma simple de observar tu situación desde múltiples ángulos.",
      canonical: "/tarot/tres-cartas/general",
    },
    access: "free",
    enabled: false,
  },

  trabajo: {
    slug: "trabajo",
    title: "Tres cartas — Trabajo",
    shortTitle: "Trabajo",
    description:
      "Una lectura enfocada en tu ámbito laboral o profesional: la situación actual, un desafío u oportunidad, y una acción recomendada.",
    intro:
      "Piensa en tu situación laboral o profesional. Puedes preguntar sobre un proyecto, una decisión de carrera, un conflicto o simplemente cómo evoluciona tu trayecto.",
    userContextLabel: "Tu situación laboral",
    userContextPlaceholder:
      "Ejemplo: Estoy considerando un cambio de trabajo. ¿Qué debo observar?",
    positions: [
      {
        key: "situation",
        label: "Situación actual",
        shortLabel: "Situación",
        displayOrder: 1,
        description: "El estado presente en tu ámbito laboral o profesional.",
        interpretationFocus:
          "Contexto, recursos disponibles y energía del momento profesional.",
      },
      {
        key: "challenge_opportunity",
        label: "Desafío u oportunidad",
        shortLabel: "Desafío/Oportunidad",
        displayOrder: 2,
        description: "Lo que requiere atención o lo que podría transformarse.",
        interpretationFocus:
          "Identificar un punto de crecimiento, tensión o potencial en lo profesional.",
      },
      {
        key: "recommended_action",
        label: "Acción recomendada",
        shortLabel: "Acción",
        displayOrder: 3,
        description: "Lo que conviene hacer, cultivar o considerar.",
        interpretationFocus:
          "Una orientación práctica y reflexiva sin ordenar decisiones definitivas.",
      },
    ] as const,
    synthesisInstructions:
      "Integrar situación, desafío y acción como una estrategia de reflexión. Mostrar cómo la acción responde al desafío en el contexto actual. Mantener tono profesional pero simbólico.",
    seo: {
      title: "Tirada de Tarot de Trabajo de 3 cartas | Creovision",
      description:
        "Una lectura enfocada en tu ámbito laboral o profesional: situación actual, desafío u oportunidad, y una acción recomendada.",
      canonical: "/tarot/tres-cartas/trabajo",
    },
    access: "free",
    enabled: false,
  },

  decision: {
    slug: "decision",
    title: "Tres cartas — Decisión",
    shortTitle: "Decisión",
    description:
      "Una lectura para reflexionar antes de decidir: qué impulsa la decisión, qué debes considerar, y un criterio para elegir.",
    intro:
      "Piensa en una decisión que necesitas tomar. No es un oráculo que te dirá qué hacer, sino una herramienta para ordenar lo que ya sabes.",
    userContextLabel: "Tu decisión",
    userContextPlaceholder:
      "Ejemplo: ¿Debo hacer este cambio? Necesito claridad para decidir.",
    positions: [
      {
        key: "decision_driver",
        label: "Qué impulsa la decisión",
        shortLabel: "Impulso",
        displayOrder: 1,
        description:
          "La razón, el deseo o la presión que te lleva a considerar esta decisión.",
        interpretationFocus:
          "Entender qué está motivando el cambio sin juzgarlo como correcto o incorrecto.",
      },
      {
        key: "consideration",
        label: "Qué debes considerar",
        shortLabel: "Consideración",
        displayOrder: 2,
        description: "Un aspecto que quizá no has observado o que merece atención.",
        interpretationFocus:
          "Ampliar perspectiva. Qué matiz, riesgo o recurso no está en la conversación habitual.",
      },
      {
        key: "choice_criteria",
        label: "Criterio para elegir",
        shortLabel: "Criterio",
        displayOrder: 3,
        description:
          "Un principio o valor que puede ayudarte a decidir de forma alineada contigo.",
        interpretationFocus:
          "Ofrecer un valor o pregunta reflexiva que conecte con tus criterios personales.",
      },
    ] as const,
    synthesisInstructions:
      "Conectar impulso, consideración y criterio como un marco reflexivo para la decisión. Mostrar cómo el criterio ayuda a evaluar el impulso considerando lo importante. No afirmar que hay una única respuesta correcta.",
    seo: {
      title: "Tirada de Tarot para Decisiones de 3 cartas | Creovision",
      description:
        "Una lectura para reflexionar antes de decidir: qué impulsa la decisión, qué debes considerar, y un criterio para elegir.",
      canonical: "/tarot/tres-cartas/decision",
    },
    access: "free",
    enabled: false,
  },
};

export const enabledThreeCardReadings = Object.entries(threeCardReadings)
  .filter(([_, config]) => config.enabled)
  .map(([_, config]) => config);
