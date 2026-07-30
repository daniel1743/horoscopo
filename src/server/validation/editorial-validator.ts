import { ZODIAC_SIGNS, type RuleFactPayload } from "../rules/domain";
import type { PlanetaryBody } from "../planetary/planetary-engine";
import type {
  EditorialValidationInput,
  EditorialValidationIssue,
  EditorialValidationIssueCode,
  EditorialValidationResult,
  EditorialValidationSeverity,
  ValidationMetrics,
} from "./domain";
import { ALL_EDITORIAL_PATTERNS } from "./pattern-catalog";

const SECTION_KEYS = ["love", "work", "wellbeing", "reflection"] as const;
const TEXT_PATHS = [
  "title",
  "summary",
  "sections.love",
  "sections.work",
  "sections.wellbeing",
  "sections.reflection",
  "closingMessage",
] as const;
const KNOWN_BODIES: readonly PlanetaryBody[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

const BODY_LABELS: Readonly<Record<PlanetaryBody, readonly string[]>> = Object.freeze({
  sun: ["sol"],
  moon: ["luna"],
  mercury: ["mercurio"],
  venus: ["venus"],
  mars: ["marte"],
  jupiter: ["jupiter", "júpiter"],
  saturn: ["saturno"],
  uranus: ["urano"],
  neptune: ["neptuno"],
  pluto: ["pluton", "plutón"],
});

const ASPECT_LABELS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  conjunction: ["conjuncion", "conjunción"],
  opposition: ["oposicion", "oposición"],
  trine: ["trigono", "trígono"],
  square: ["cuadratura"],
  sextile: ["sextil"],
});

const TEMPORAL_EVENT_LABELS: readonly { label: string; eventType: string }[] = [
  { label: "ingreso", eventType: "sign_ingress_focus" },
  { label: "estacion", eventType: "station_focus" },
  { label: "estación", eventType: "station_focus" },
  { label: "luna nueva", eventType: "new_moon" },
  { label: "luna llena", eventType: "full_moon" },
] as const;
const GENERIC_PHRASES = [
  "escucha tu intuicion",
  "confia en el universo",
  "todo fluye",
  "abre tu energia",
  "vibra alto",
] as const;
const FILLER_WORDS = ["podria", "podría", "quizas", "quizás", "tal vez"] as const;

interface AuthorizedIndex {
  factIds: ReadonlySet<string>;
  sourceEventIds: ReadonlySet<string>;
  signs: ReadonlySet<string>;
  bodies: ReadonlySet<PlanetaryBody>;
  aspectTypes: ReadonlySet<string>;
  eventTypes: ReadonlySet<string>;
  dates: ReadonlySet<string>;
  numbers: ReadonlySet<string>;
  retrogradeBodies: ReadonlySet<PlanetaryBody>;
  directBodies: ReadonlySet<PlanetaryBody>;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");
}

function wordPattern(phrase: string): RegExp {
  const escaped = normalizeText(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, "iu");
}

function includesPhrase(text: string, phrase: string): boolean {
  return wordPattern(phrase).test(normalizeText(text));
}

function issue(
  code: EditorialValidationIssueCode,
  severity: EditorialValidationSeverity,
  path: string,
  message: string,
  evidence?: string,
  relatedFactIds?: readonly string[],
): EditorialValidationIssue {
  return {
    code,
    severity,
    path,
    message,
    ...(evidence ? { evidence } : {}),
    ...(relatedFactIds && relatedFactIds.length > 0 ? { relatedFactIds } : {}),
  };
}

function addPayloadAuthorization(payload: RuleFactPayload, index: MutableAuthorizedIndex): void {
  index.eventTypes.add(payload.kind);
  if (payload.kind === "aspect_emphasis") {
    index.aspectTypes.add(payload.aspectType);
    for (const body of payload.sourceBodies) index.bodies.add(body);
    index.numbers.add(String(payload.solarHouse));
  }
  if (payload.kind === "sign_ingress_focus") {
    index.bodies.add(payload.body);
    index.signs.add(payload.toSign);
    index.numbers.add(String(payload.solarHouse));
  }
  if (payload.kind === "station_focus") {
    index.bodies.add(payload.body);
    if (payload.stationType === "retrograde") index.retrogradeBodies.add(payload.body);
    if (payload.stationType === "direct") index.directBodies.add(payload.body);
  }
  if (payload.kind === "lunar_phase_focus") {
    index.bodies.add("moon");
    index.eventTypes.add(payload.phase);
    index.numbers.add(String(payload.solarHouse));
  }
}

interface MutableAuthorizedIndex {
  factIds: Set<string>;
  sourceEventIds: Set<string>;
  signs: Set<string>;
  bodies: Set<PlanetaryBody>;
  aspectTypes: Set<string>;
  eventTypes: Set<string>;
  dates: Set<string>;
  numbers: Set<string>;
  retrogradeBodies: Set<PlanetaryBody>;
  directBodies: Set<PlanetaryBody>;
}

function buildAuthorizedIndex(input: EditorialValidationInput): AuthorizedIndex {
  const index: MutableAuthorizedIndex = {
    factIds: new Set(),
    sourceEventIds: new Set(),
    signs: new Set([input.context.sign]),
    bodies: new Set(),
    aspectTypes: new Set(),
    eventTypes: new Set(),
    dates: new Set([input.context.windowStart, input.context.windowEnd]),
    numbers: new Set(),
    retrogradeBodies: new Set(),
    directBodies: new Set(),
  };
  for (const fact of input.context.selectedFacts) {
    index.factIds.add(fact.id);
    index.signs.add(fact.sign);
    index.dates.add(fact.occurredAt);
    index.numbers.add(String(fact.importance));
    index.numbers.add(String(fact.confidence));
    index.numbers.add(String(fact.priority));
    for (const eventId of fact.sourceEventIds) index.sourceEventIds.add(eventId);
    addPayloadAuthorization(fact.payload, index);
  }
  return index;
}

function readPath(input: EditorialValidationInput, path: (typeof TEXT_PATHS)[number]): string {
  if (path === "title") return typeof input.draft.title === "string" ? input.draft.title : "";
  if (path === "summary") return typeof input.draft.summary === "string" ? input.draft.summary : "";
  if (path === "closingMessage")
    return typeof input.draft.closingMessage === "string" ? input.draft.closingMessage : "";
  const value =
    input.draft.sections[path.replace("sections.", "") as keyof typeof input.draft.sections];
  return typeof value === "string" ? value : "";
}

function allTextEntries(
  input: EditorialValidationInput,
): readonly { path: string; text: string }[] {
  return TEXT_PATHS.map((path) => ({ path, text: readPath(input, path) }));
}

function checkStructure(input: EditorialValidationInput, issues: EditorialValidationIssue[]): void {
  const draft = input.draft as unknown as Record<string, unknown>;
  const sections = draft.sections as Record<string, unknown> | undefined;
  if (typeof sections !== "object" || sections === null || Array.isArray(sections)) {
    issues.push(issue("INVALID_FIELD_TYPE", "error", "sections", "sections debe ser objeto"));
    return;
  }
  for (const section of SECTION_KEYS) {
    const value = sections[section];
    if (!(section in sections)) {
      issues.push(
        issue(
          "REQUIRED_SECTION_MISSING",
          "error",
          `sections.${section}`,
          "seccion requerida ausente",
        ),
      );
      continue;
    }
    if (typeof value !== "string") {
      issues.push(
        issue("INVALID_FIELD_TYPE", "error", `sections.${section}`, "seccion debe ser string"),
      );
      continue;
    }
    if (value.length === 0)
      issues.push(issue("EMPTY_SECTION", "error", `sections.${section}`, "seccion vacia"));
    if (value.length > 0 && value.trim().length === 0) {
      issues.push(
        issue(
          "WHITESPACE_ONLY_TEXT",
          "error",
          `sections.${section}`,
          "texto compuesto solo por espacios",
        ),
      );
    }
  }
  for (const key of Object.keys(sections)) {
    if (!SECTION_KEYS.includes(key as never)) {
      issues.push(
        issue("UNEXPECTED_STRUCTURE", "error", `sections.${key}`, "seccion adicional no permitida"),
      );
    }
  }
  for (const { path, text } of allTextEntries(input)) {
    const constraint =
      path === "title"
        ? input.constraints.title
        : path === "summary"
          ? input.constraints.summary
          : path === "closingMessage"
            ? input.constraints.closingMessage
            : input.constraints.section;
    if (typeof text !== "string") {
      issues.push(issue("INVALID_FIELD_TYPE", "error", path, "campo debe ser string"));
    } else if (text.length < constraint.min || text.length > constraint.max) {
      issues.push(
        issue("LENGTH_OUT_OF_RANGE", "error", path, "longitud fuera de rango", String(text.length)),
      );
    }
  }
}

function checkTraceability(
  input: EditorialValidationInput,
  index: AuthorizedIndex,
  issues: EditorialValidationIssue[],
): void {
  for (const factId of input.draft.usedFactIds) {
    if (!index.factIds.has(factId)) {
      issues.push(issue("UNKNOWN_FACT_ID", "error", "usedFactIds", "factId no autorizado", factId));
    }
  }
  for (const eventId of input.draft.sourceEventIds) {
    if (!index.sourceEventIds.has(eventId)) {
      issues.push(
        issue(
          "UNKNOWN_SOURCE_EVENT_ID",
          "error",
          "sourceEventIds",
          "sourceEventId no autorizado",
          eventId,
        ),
      );
    }
  }
}

function checkEntities(
  input: EditorialValidationInput,
  index: AuthorizedIndex,
  issues: EditorialValidationIssue[],
): void {
  for (const { path, text } of allTextEntries(input)) {
    for (const body of KNOWN_BODIES) {
      if (
        BODY_LABELS[body].some((label) => includesPhrase(text, label)) &&
        !index.bodies.has(body)
      ) {
        issues.push(
          issue("UNAUTHORIZED_PLANET", "error", path, "planeta no presente en hechos fuente", body),
        );
      }
    }
    for (const sign of ZODIAC_SIGNS) {
      if (includesPhrase(text, sign) && !index.signs.has(sign)) {
        issues.push(issue("UNAUTHORIZED_SIGN", "error", path, "signo no autorizado", sign));
      }
    }
    for (const [aspectType, labels] of Object.entries(ASPECT_LABELS)) {
      if (
        labels.some((label) => includesPhrase(text, label)) &&
        !index.aspectTypes.has(aspectType)
      ) {
        issues.push(
          issue(
            index.aspectTypes.size === 0 ? "UNKNOWN_ASPECT_TYPE" : "UNAUTHORIZED_ASPECT",
            "error",
            path,
            "aspecto no autorizado por hechos fuente",
            aspectType,
          ),
        );
      }
    }
    for (const eventLabel of TEMPORAL_EVENT_LABELS) {
      if (includesPhrase(text, eventLabel.label) && !index.eventTypes.has(eventLabel.eventType)) {
        issues.push(
          issue(
            "INVENTED_TEMPORAL_EVENT",
            "error",
            path,
            "evento temporal no respaldado",
            eventLabel.label,
          ),
        );
      }
    }
    if (
      /\b(casa\s+\d{1,2}|casa\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce))\b/iu.test(
        text,
      )
    ) {
      issues.push(
        issue("ASTROLOGICAL_HOUSE_REFERENCE", "error", path, "casa astrologica no proporcionada"),
      );
    }
  }
}

function checkNumbers(
  input: EditorialValidationInput,
  index: AuthorizedIndex,
  issues: EditorialValidationIssue[],
): void {
  for (const { path, text } of allTextEntries(input)) {
    const degreeMatches =
      text.match(/\b\d{1,3}(?:[,.]\d+)?\s*(?:°|grados?|orbe|angulo|ángulo)\b/giu) ?? [];
    for (const match of degreeMatches) {
      const normalizedNumber = match.match(/\d{1,3}(?:[,.]\d+)?/)?.[0].replace(",", ".");
      if (normalizedNumber && !index.numbers.has(normalizedNumber)) {
        issues.push(
          issue(
            "UNSUPPORTED_NUMERIC_CLAIM",
            "error",
            path,
            "grado, orbe o angulo no respaldado",
            match,
          ),
        );
      }
    }
    const dateMatches = text.match(/\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?\b/gu) ?? [];
    for (const match of dateMatches) {
      if (![...index.dates].some((date) => date.includes(match))) {
        issues.push(
          issue("UNSUPPORTED_NUMERIC_CLAIM", "error", path, "fecha no respaldada", match),
        );
      }
    }
  }
}

function checkPolicy(input: EditorialValidationInput, issues: EditorialValidationIssue[]): void {
  for (const { path, text } of allTextEntries(input)) {
    const normalizedText = normalizeText(text);
    for (const pattern of ALL_EDITORIAL_PATTERNS) {
      const match = normalizedText.match(pattern.pattern);
      if (match)
        issues.push(issue(pattern.code, pattern.severity, path, pattern.message, match[0]));
    }
    for (const forbiddenPattern of input.constraints.forbiddenPatterns) {
      if (includesPhrase(text, forbiddenPattern)) {
        issues.push(
          issue(
            "ABSOLUTE_CERTAINTY",
            "error",
            path,
            "patron prohibido por politica",
            forbiddenPattern,
          ),
        );
      }
    }
  }
}

function sentenceList(text: string): readonly string[] {
  return text
    .split(/[.!?]+/u)
    .map((sentence) => normalizeText(sentence).trim())
    .filter((sentence) => sentence.length > 20);
}

function checkCoherence(
  input: EditorialValidationInput,
  index: AuthorizedIndex,
  issues: EditorialValidationIssue[],
): void {
  for (const { path, text } of allTextEntries(input)) {
    for (const body of KNOWN_BODIES) {
      const mentionsBody = BODY_LABELS[body].some((label) => includesPhrase(text, label));
      const mentionsRetrograde =
        includesPhrase(text, "retrogrado") || includesPhrase(text, "retrograda");
      const mentionsDirect = includesPhrase(text, "directo") || includesPhrase(text, "directa");
      if (mentionsBody && mentionsRetrograde && mentionsDirect) {
        issues.push(
          issue(
            "DIRECT_RETROGRADE_CONTRADICTION",
            "error",
            path,
            "planeta descrito como directo y retrogrado",
            body,
          ),
        );
      }
      if (mentionsBody && mentionsRetrograde && index.directBodies.has(body)) {
        issues.push(
          issue(
            "DIRECT_RETROGRADE_CONTRADICTION",
            "error",
            path,
            "retrogradacion contradice hechos directos",
            body,
          ),
        );
      }
      if (mentionsBody && mentionsDirect && index.retrogradeBodies.has(body)) {
        issues.push(
          issue(
            "DIRECT_RETROGRADE_CONTRADICTION",
            "error",
            path,
            "movimiento directo contradice hechos retrogrados",
            body,
          ),
        );
      }
    }
    if (/\b(se abre|comienza|inicio)\b.*\b(se cierra|termina|finaliza)\b/iu.test(text)) {
      issues.push(
        issue(
          "SECTION_CONTRADICTION",
          "warning",
          path,
          "inicio y cierre afirmados en la misma seccion",
        ),
      );
    }
    if (/\b(no hay|sin)\b.*\b(oportunidad|apertura)\b.*\b(oportunidad|apertura)\b/iu.test(text)) {
      issues.push(
        issue("SECTION_CONTRADICTION", "warning", path, "afirmacion y negacion detectadas"),
      );
    }
    if (
      /\b(no hay|sin)\b.*\b(conjuncion|conjunción|oposicion|oposición|trigono|trígono|cuadratura|sextil)\b/iu.test(
        text,
      )
    ) {
      issues.push(
        issue(
          "ASPECT_AFFIRM_NEGATE_CONTRADICTION",
          "warning",
          path,
          "aspecto afirmado o negado ambiguamente",
        ),
      );
    }
  }
  const periodWords: Record<string, readonly string[]> = {
    daily: ["semana", "mes"],
    weekly: ["hoy", "mes"],
    monthly: ["hoy", "semana"],
  };
  for (const { path, text } of allTextEntries(input)) {
    for (const word of periodWords[input.context.period] ?? []) {
      if (includesPhrase(text, word)) {
        issues.push(
          issue(
            "PERIOD_MISMATCH",
            "warning",
            path,
            "referencia temporal no coincide con periodo",
            word,
          ),
        );
      }
    }
  }
}

function checkQuality(input: EditorialValidationInput, issues: EditorialValidationIssue[]): number {
  const allSentences = allTextEntries(input).flatMap(({ text }) => sentenceList(text));
  const counts = new Map<string, number>();
  for (const sentence of allSentences) counts.set(sentence, (counts.get(sentence) ?? 0) + 1);
  let duplicatedSentenceCount = 0;
  for (const [sentence, count] of counts) {
    if (count > 1) {
      duplicatedSentenceCount += count - 1;
      issues.push(
        issue(
          "DUPLICATED_SECTION_TEXT",
          "warning",
          "sections",
          "oracion duplicada literalmente",
          sentence,
        ),
      );
    }
  }
  for (const { path, text } of allTextEntries(input)) {
    const normalized = normalizeText(text);
    const words = normalized.match(/\b[\p{L}\p{N}]+\b/gu) ?? [];
    const wordCounts = new Map<string, number>();
    for (const word of words.filter((item) => item.length > 4)) {
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
    }
    if ([...wordCounts.values()].some((count) => count >= 8)) {
      issues.push(issue("EXCESSIVE_REPETITION", "warning", path, "repeticion excesiva detectada"));
    }
    const genericHits = GENERIC_PHRASES.filter((phrase) => normalized.includes(phrase)).length;
    if (genericHits >= 2) {
      issues.push(
        issue(
          "GENERIC_PHRASE_DENSITY_HIGH",
          "warning",
          path,
          "densidad elevada de frases genericas",
        ),
      );
    }
    const fillerHits = FILLER_WORDS.reduce(
      (total, word) => total + (normalized.match(wordPattern(word))?.length ?? 0),
      0,
    );
    if (fillerHits >= 4) {
      issues.push(issue("FILLER_PHRASE_EXCESS", "warning", path, "exceso de muletillas"));
    }
  }
  if (input.context.selectedFacts.length > 0 && input.draft.usedFactIds.length === 0) {
    issues.push(
      issue("TEXT_WITHOUT_FACT_TRACE", "warning", "usedFactIds", "texto sin conexion con factIds"),
    );
  }
  return duplicatedSentenceCount;
}

function issueRank(issueSeverity: EditorialValidationSeverity): number {
  return issueSeverity === "error" ? 0 : 1;
}

function sortIssues(
  issues: readonly EditorialValidationIssue[],
): readonly EditorialValidationIssue[] {
  return [...issues].sort(
    (left, right) =>
      issueRank(left.severity) - issueRank(right.severity) ||
      left.path.localeCompare(right.path) ||
      left.code.localeCompare(right.code) ||
      (left.evidence ?? "").localeCompare(right.evidence ?? ""),
  );
}

function countWords(text: string): number {
  const matches = normalizeText(text).match(/\b[\p{L}\p{N}]+\b/gu);
  return matches?.length ?? 0;
}

export function validateEditorialDraft(input: EditorialValidationInput): EditorialValidationResult {
  const before = JSON.stringify(input);
  const issues: EditorialValidationIssue[] = [];
  const index = buildAuthorizedIndex(input);
  checkStructure(input, issues);
  checkTraceability(input, index, issues);
  checkEntities(input, index, issues);
  checkNumbers(input, index, issues);
  checkPolicy(input, issues);
  checkCoherence(input, index, issues);
  const duplicatedSentenceCount = checkQuality(input, issues);
  if (before !== JSON.stringify(input)) {
    throw new Error("EditorialValidationInput mutado");
  }
  const sortedIssues = sortIssues(issues);
  const allText = allTextEntries(input)
    .map(({ text }) => text)
    .join("\n");
  const metrics: ValidationMetrics = {
    totalCharacters: allText.length,
    totalWords: countWords(allText),
    sectionsChecked: SECTION_KEYS.length,
    recognizedFactReferences: input.draft.usedFactIds.filter((factId) => index.factIds.has(factId))
      .length,
    unknownEntityMentions: sortedIssues.filter((item) =>
      [
        "UNAUTHORIZED_PLANET",
        "UNAUTHORIZED_SIGN",
        "UNAUTHORIZED_ASPECT",
        "UNKNOWN_ASPECT_TYPE",
      ].includes(item.code),
    ).length,
    duplicatedSentenceCount,
    blockingIssueCount: sortedIssues.filter((item) => item.severity === "error").length,
    warningCount: sortedIssues.filter((item) => item.severity === "warning").length,
  };
  return { valid: metrics.blockingIssueCount === 0, issues: sortedIssues, metrics };
}
