import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveAiProvider, streamChatCompletion } from "./gateway.server";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

function createSseResponse(text: string): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`),
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(body, { status: 200 });
}

async function drain(stream: ReadableStream<Uint8Array>): Promise<void> {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) return;
  }
}

describe("AI gateway provider routing", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AI_PROVIDER;
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.DEEPSEEK_MODEL;
    delete process.env.DEEPSEEK_MODEL_FAST;
    delete process.env.DEEPSEEK_BASE_URL;
    delete process.env.LOVABLE_API_KEY;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("usa DeepSeek cuando DEEPSEEK_API_KEY está configurada", async () => {
    process.env.DEEPSEEK_API_KEY = "deepseek-test-key";
    const fetchMock = vi.fn().mockResolvedValue(createSseResponse("respuesta deepseek"));
    globalThis.fetch = fetchMock;

    const result = await streamChatCompletion({
      alias: "fast",
      messages: [{ role: "user", content: "Hola" }],
    });
    await drain(result.stream);

    expect(resolveAiProvider()).toBe("deepseek");
    expect(result.getText()).toBe("respuesta deepseek");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer deepseek-test-key",
        }),
      }),
    );

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody.model).toBe("deepseek-v4-flash");
    expect(requestBody.stream).toBe(true);
  });

  it("mantiene Lovable como respaldo si no existe DEEPSEEK_API_KEY", async () => {
    process.env.LOVABLE_API_KEY = "lovable-test-key";
    const fetchMock = vi.fn().mockResolvedValue(createSseResponse("respuesta lovable"));
    globalThis.fetch = fetchMock;

    const result = await streamChatCompletion({
      alias: "fast",
      messages: [{ role: "user", content: "Hola" }],
    });
    await drain(result.stream);

    expect(resolveAiProvider()).toBe("lovable");
    expect(result.getText()).toBe("respuesta lovable");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Lovable-API-Key": "lovable-test-key",
        }),
      }),
    );
  });
});
