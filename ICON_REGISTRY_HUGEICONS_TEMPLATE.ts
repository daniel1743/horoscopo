/**
 * Registro único de iconos de interfaz — Migrado a Hugeicons
 * Uso: `<Icon name="search" />` en lugar de importar directamente.
 *
 * IMPORTANTE: Este archivo SOLO será actualizado cuando npm install de Hugeicons
 * complete correctamente. Este es el template para Fase 3.
 */

import {
  Search01Icon,
  UserRound01Icon,
  Menu01Icon,
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Heart01Icon,
  History01Icon,
  Calendar01Icon,
  Share2Icon,
  Settings01Icon,
  LogOut01Icon,
  Mail01Icon,
  Sparkles01Icon,
  Moon01Icon,
  Sun01Icon,
  Layers3Icon,
  HeartHandshake01Icon,
  BookOpen01Icon,
  AlertTriangle01Icon,
  ChevronDown01Icon,
  ChevronRight01Icon,
  CircleIcon,
  CircleDotIcon,
  CheckIcon,
  ChevronLeft01Icon,
  ChevronUp01Icon,
  MoreHorizontal01Icon,
  Minus01Icon,
  GripVertical01Icon,
  Eye01Icon,
  EyeOff01Icon,
  PanelLeft01Icon,
  LogIn01Icon,
  type HugeIcon,
} from "@hugeicons/core-free-icons";

export const iconRegistry = {
  // Búsqueda y navegación
  search: Search01Icon,
  menu: Menu01Icon,
  close: Cancel01Icon,
  back: ArrowLeft01Icon,
  forward: ArrowRight01Icon,

  // Usuarios y cuentas
  user: UserRound01Icon,
  account: UserRound01Icon,
  login: LogIn01Icon,
  logout: LogOut01Icon,

  // Interacción y estado
  favorite: Heart01Icon,
  history: History01Icon,
  calendar: Calendar01Icon,
  share: Share2Icon,
  settings: Settings01Icon,
  email: Mail01Icon,
  premium: Sparkles01Icon,

  // Astro/Luna
  moon: Moon01Icon,
  sun: Sun01Icon,

  // Tarot y contenido
  tarot: Layers3Icon,
  compatibility: HeartHandshake01Icon,
  article: BookOpen01Icon,
  warning: AlertTriangle01Icon,

  // Chevrons y flechas
  expand: ChevronDown01Icon,
  chevronRight: ChevronRight01Icon,
  chevronLeft: ChevronLeft01Icon,
  chevronUp: ChevronUp01Icon,

  // Selección y formas
  check: CheckIcon,
  circle: CircleIcon,
  circleDot: CircleDotIcon,

  // UI utilities
  moreHorizontal: MoreHorizontal01Icon,
  minus: Minus01Icon,
  gripVertical: GripVertical01Icon,

  // Visibilidad
  eye: Eye01Icon,
  eyeOff: EyeOff01Icon,

  // Panel
  panelLeft: PanelLeft01Icon,

  // Fases lunares (usando equivalentes)
  moon_new: CircleIcon,
  moon_waxing_crescent: Moon01Icon,
  moon_first_quarter: CircleDotIcon,
  moon_waxing_gibbous: Moon01Icon,
  moon_full: Moon01Icon,
  moon_waning_gibbous: Moon01Icon,
  moon_last_quarter: CircleDotIcon,
  moon_waning_crescent: Moon01Icon,
} as const satisfies Record<string, HugeIcon>;

export type IconName = keyof typeof iconRegistry;

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const iconStroke = {
  default: 1.5,
  decorative: 1.25,
} as const;
