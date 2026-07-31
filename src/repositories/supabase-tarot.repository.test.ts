import { describe, expect, it } from "vitest";
import {
  applyPublishedTarotFilters,
  isPublicTarotPublication,
  isTarotDraftPreviewEnabled,
} from "./supabase-tarot.repository";

class FakeQuery {
  readonly calls: Array<[string, string, unknown, unknown?]> = [];

  eq(column: string, value: unknown) {
    this.calls.push(["eq", column, value]);
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.calls.push(["not", column, operator, value]);
    return this;
  }

  lte(column: string, value: unknown) {
    this.calls.push(["lte", column, value]);
    return this;
  }
}

describe("supabase tarot repository publication filters", () => {
  it("construye consultas publicas solo para published con fecha vigente", () => {
    const nowIso = "2026-07-31T12:00:00.000Z";
    const query = new FakeQuery();

    expect(applyPublishedTarotFilters(query, nowIso)).toBe(query);
    expect(query.calls).toEqual([
      ["eq", "status", "published"],
      ["not", "published_at", "is", null],
      ["lte", "published_at", nowIso],
    ]);
  });

  it("published devuelve solo published con published_at pasado o actual", () => {
    const nowIso = "2026-07-31T12:00:00.000Z";

    expect(
      isPublicTarotPublication(
        { status: "published", published_at: "2026-07-31T11:59:59.000Z" },
        nowIso,
      ),
    ).toBe(true);
    expect(
      isPublicTarotPublication(
        { status: "published", published_at: "2026-07-31T12:00:00.000Z" },
        nowIso,
      ),
    ).toBe(true);
  });

  it("excluye published_at nulo, futuro y drafts", () => {
    const nowIso = "2026-07-31T12:00:00.000Z";

    expect(isPublicTarotPublication({ status: "published", published_at: null }, nowIso)).toBe(
      false,
    );
    expect(
      isPublicTarotPublication(
        { status: "published", published_at: "2026-08-01T00:00:00.000Z" },
        nowIso,
      ),
    ).toBe(false);
    expect(
      isPublicTarotPublication(
        { status: "draft", published_at: "2026-07-31T11:59:59.000Z" },
        nowIso,
      ),
    ).toBe(false);
  });

  it("bloquea preview en produccion aunque la variable exista", () => {
    expect(
      isTarotDraftPreviewEnabled({
        DEV: false,
        VITE_TAROT_PREVIEW_DRAFTS: "true",
      }),
    ).toBe(false);
  });

  it("bloquea preview en desarrollo sin variable explicita", () => {
    expect(
      isTarotDraftPreviewEnabled({
        DEV: true,
        VITE_TAROT_PREVIEW_DRAFTS: undefined,
      }),
    ).toBe(false);
    expect(
      isTarotDraftPreviewEnabled({
        DEV: true,
        VITE_TAROT_PREVIEW_DRAFTS: "false",
      }),
    ).toBe(false);
  });

  it("habilita preview solo en desarrollo con VITE_TAROT_PREVIEW_DRAFTS=true", () => {
    expect(
      isTarotDraftPreviewEnabled({
        DEV: true,
        VITE_TAROT_PREVIEW_DRAFTS: "true",
      }),
    ).toBe(true);
  });
});
