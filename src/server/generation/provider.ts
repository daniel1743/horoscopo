import type {
  ProviderGenerationRequest,
  ProviderGenerationResponse,
  TextGenerationProvider,
} from "./domain";

export class DeterministicTestGenerationProvider implements TextGenerationProvider {
  readonly providerId = "deterministic-test-provider";
  readonly modelId = "test-model@2e";
  private calls: ProviderGenerationRequest[] = [];

  constructor(private readonly responseFactory: (request: ProviderGenerationRequest) => string) {}

  get callCount(): number {
    return this.calls.length;
  }

  get requests(): readonly ProviderGenerationRequest[] {
    return this.calls;
  }

  async generate(request: ProviderGenerationRequest): Promise<ProviderGenerationResponse> {
    this.calls = [...this.calls, request];
    return {
      rawText: this.responseFactory(request),
      providerId: this.providerId,
      modelId: this.modelId,
      finishReason: "stop",
      requestId: request.metadata.requestId,
    };
  }
}

export class FailingTestGenerationProvider implements TextGenerationProvider {
  readonly providerId = "failing-test-provider";
  readonly modelId = "test-model@2e";
  private calls = 0;

  get callCount(): number {
    return this.calls;
  }

  async generate(): Promise<ProviderGenerationResponse> {
    this.calls += 1;
    throw new Error("provider failure");
  }
}
