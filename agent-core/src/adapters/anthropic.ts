// An Anthropic (Claude) implementation of LlmClient. Like the Genkit adapter,
// this is the only file that imports the provider SDK — the agents never see it.
// Uses Claude's structured-output support (messages.parse + zodOutputFormat) so
// each agent gets a value validated against its Zod schema.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { LlmClient } from "../llm";

export interface AnthropicClientOptions {
  /** API key. Defaults to ANTHROPIC_API_KEY from the environment. */
  apiKey?: string;
  /** Model id. Defaults to a cheap, fast model that supports structured outputs. */
  model?: string;
  /** Max output tokens per call. */
  maxTokens?: number;
}

// Haiku 4.5 is the cheapest Claude model that supports structured outputs —
// plenty for these narrow, single-purpose agent jobs. Bump to claude-sonnet-5
// or claude-opus-4-8 for higher-quality artifacts.
const DEFAULT_MODEL = "claude-haiku-4-5";
const DEFAULT_MAX_TOKENS = 16000;

export function createAnthropicClient(options: AnthropicClientOptions = {}): LlmClient {
  const client = new Anthropic(options.apiKey ? { apiKey: options.apiKey } : {});
  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

  return {
    async generate({ system, prompt, schema }) {
      const response = await client.messages.parse({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
        output_config: { format: zodOutputFormat(schema) },
      });

      if (response.stop_reason === "refusal") {
        throw new Error("The model declined to respond to this request.");
      }
      const parsed = response.parsed_output;
      if (parsed == null) {
        throw new Error("Anthropic returned no structured output matching the schema.");
      }
      return parsed;
    },
  };
}
