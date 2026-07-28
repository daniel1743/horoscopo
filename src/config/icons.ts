/**
 * Registro único de iconos de interfaz.
 * Uso: `<Icon name="search" />` en lugar de importar de lucide-react en cada página.
 */
import {
  Search,
  UserRound,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Heart,
  History,
  CalendarDays,
  Share2,
  Settings,
  LogIn,
  LogOut,
  Mail,
  Sparkles,
  Moon,
  MoonStar,
  Sun,
  Layers3,
  HeartHandshake,
  BookOpen,
  TriangleAlert,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

export const iconRegistry = {
  search: Search,
  user: UserRound,
  account: UserRound,
  menu: Menu,
  close: X,
  back: ArrowLeft,
  forward: ArrowRight,
  favorite: Heart,
  history: History,
  calendar: CalendarDays,
  share: Share2,
  settings: Settings,
  login: LogIn,
  logout: LogOut,
  email: Mail,
  premium: Sparkles,
  moon: Moon,
  sun: Sun,
  tarot: Layers3,
  compatibility: HeartHandshake,
  article: BookOpen,
  warning: TriangleAlert,
  expand: ChevronDown,
  chevronRight: ChevronRight,
  moon_new: Circle,
  moon_waxing_crescent: Moon,
  moon_first_quarter: CircleDot,
  moon_waxing_gibbous: Moon,
  moon_full: MoonStar,
  moon_waning_gibbous: Moon,
  moon_last_quarter: CircleDot,
  moon_waning_crescent: Moon,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconRegistry;

export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const iconStroke = {
  default: 1.75,
  decorative: 1.5,
} as const;
