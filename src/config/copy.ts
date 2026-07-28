/**
 * Textos reutilizables: CTAs, estados vacíos, feedback.
 * NO mover aquí contenido editorial único (artículos, horóscopos, etc.).
 */

export const copy = {
  actions: {
    readMore: "Leer más",
    viewAll: "Ver todo",
    continue: "Continuar",
    back: "Volver",
    close: "Cerrar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    share: "Compartir",
    search: "Buscar",
    retry: "Intentar nuevamente",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    createAccount: "Crear cuenta",
    account: "Mi espacio",
  },
  horoscope: {
    chooseSign: "Elige tu signo",
    viewHoroscope: "Ver mi horóscopo",
  },
  tarot: {
    drawCard: "Sacar una carta",
    revealCard: "Revelar carta",
    newReading: "Nueva lectura",
    startReading: "Comenzar lectura",
  },
  compatibility: {
    viewResult: "Ver compatibilidad",
  },
  moon: {
    viewToday: "Descubrir la luna de hoy",
  },
  loading: {
    default: "Cargando...",
    saving: "Guardando...",
  },
  feedback: {
    saved: "Cambios guardados correctamente.",
    error: "No pudimos completar la acción.",
    noResults: "No encontramos resultados.",
    empty: "Todavía no hay contenido disponible.",
  },
  emptyStates: {
    favoritesTitle: "Todavía no tienes favoritos",
    favoritesDescription: "Guarda artículos y lecturas para encontrarlos aquí.",
    historyTitle: "Tu historial está vacío",
    historyDescription: "Tus lecturas recientes aparecerán en este espacio.",
  },
} as const;

export type Copy = typeof copy;
