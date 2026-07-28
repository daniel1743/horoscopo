/**
 * Configuración central de IA.
 * Reexporta cada módulo para consumo desde servicios y servidor.
 * Los prompts del sistema viven ÚNICAMENTE en el servidor (src/lib/ai/prompts.server.ts).
 */
export * from "./assistant";
export * from "./limits";
export * from "./memory";
export * from "./safety";
export * from "./retrieval";
export * from "./model-routing";
