import { describe, expect, it } from "vitest";
import { TarotService } from "./tarot.service";
import type { TarotRepository } from "@/repositories/tarot.repository";

function createRepositorySpy() {
  const calls: unknown[] = [];
  const repo: TarotRepository = {
    getPublishedCards: async (opts) => {
      calls.push(opts);
      return [];
    },
    getCardBySlug: async () => null,
    getCardByKey: async () => null,
    getPublishedCardCount: async () => 0,
    getLibrary: async () => [],
  };

  return { repo, calls };
}

describe("TarotService", () => {
  it("loadDeck carga la baraja publicada completa en modo publico", async () => {
    import.meta.env.VITE_TAROT_PREVIEW_DRAFTS = "false";
    const { repo, calls } = createRepositorySpy();
    const service = new TarotService(repo);

    await service.loadDeck();

    expect(calls).toEqual([undefined]);
  });
});
