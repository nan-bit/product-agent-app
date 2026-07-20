// Builds the real, provider-backed interview system. Only the selected
// provider's adapter (and therefore its SDK) is loaded — the other is never
// imported, so you don't need both SDKs installed to run one provider.
import { createInterviewSystem, type InterviewSystem, type LlmClient } from "@product-agent/agent-core";
import type { ServerConfig } from "./config";

export async function buildAgentSystem(config: ServerConfig): Promise<InterviewSystem> {
  let client: LlmClient;

  if (config.provider === "genkit") {
    const { createGenkitClient } = await import("@product-agent/agent-core/adapters/genkit");
    client = createGenkitClient({ apiKey: config.googleApiKey, model: config.genkitModel });
  } else {
    const { createAnthropicClient } = await import("@product-agent/agent-core/adapters/anthropic");
    client = createAnthropicClient({
      apiKey: config.anthropicApiKey,
      model: config.anthropicModel,
      maxTokens: config.maxOutputTokens,
    });
  }

  return createInterviewSystem(client, { maxTurns: config.maxTurns });
}
