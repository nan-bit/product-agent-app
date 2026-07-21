// Builds the Anthropic-backed interview system. The core stays provider-agnostic
// (agent-core depends only on the LlmClient interface); this server ships the
// Claude adapter. To swap providers, write another adapter and change this file.
import { createInterviewSystem, type InterviewSystem } from "@product-agent/agent-core";
import { createAnthropicClient } from "@product-agent/agent-core/adapters/anthropic";
import type { ServerConfig } from "./config";

export function buildAgentSystem(config: ServerConfig): InterviewSystem {
  const client = createAnthropicClient({
    apiKey: config.apiKey,
    model: config.model,
    maxTokens: config.maxOutputTokens,
  });
  return createInterviewSystem(client, { maxTurns: config.maxTurns });
}
