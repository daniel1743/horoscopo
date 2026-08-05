import type { TarotCard } from "@/types/tarot";

export type ThreeCardExperienceState =
  | "preparing"
  | "shuffling"
  | "selecting"
  | "selected"
  | "revealing"
  | "interpreting"
  | "completed"
  | "error";

export interface TarotCardCandidate {
  id: string;
  card: TarotCard;
}

export interface SelectedTarotCard {
  id: string;
  positionId: string; // "emotional_world", "relationship_dynamic", "guidance_forward"
  card: TarotCard;
}

export interface RevealedTarotCard extends SelectedTarotCard {
  // Cuando se revele, tendrá la información real de la carta
  name: string;
  image: string; // O el path de la carta
}
