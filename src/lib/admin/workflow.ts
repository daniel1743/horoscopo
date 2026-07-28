/**
 * Workflow editorial. Estados y transiciones permitidas.
 * Mantener sincronizado con el CHECK de content_workflow en la migración.
 */

export const WORKFLOW_STATES = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "archived",
] as const;
export type WorkflowState = (typeof WORKFLOW_STATES)[number];

export const WORKFLOW_LABEL: Record<WorkflowState, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  changes_requested: "Cambios solicitados",
  approved: "Aprobado",
  published: "Publicado",
  archived: "Archivado",
};

/** Matriz de transiciones válidas (state actual → estados destino). */
export const WORKFLOW_TRANSITIONS: Record<WorkflowState, readonly WorkflowState[]> = {
  draft: ["in_review", "archived"],
  in_review: ["approved", "changes_requested"],
  changes_requested: ["in_review", "draft"],
  approved: ["published", "draft"],
  published: ["archived", "draft"],
  archived: ["draft"],
};

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return WORKFLOW_TRANSITIONS[from].includes(to);
}
