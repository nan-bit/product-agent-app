// The ONLY file in agent-core that imports Genkit. Everything else depends on
// the framework-free `LlmClient` interface. Swap this out (for the raw Google
// SDK, OpenAI, a local model, etc.) without touching the agents.
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import type { LlmClient } from "../llm";

export interface GenkitClientOptions {
  /** Gemini API key. Defaults to GEMINI_API_KEY / GOOGLE_API_KEY from the environment. */
  apiKey?: string;
  /** Model reference. Defaults to a cheap, fast model suitable for these narrow agent jobs. */
  model?: string;
}

const DEFAULT_MODEL = "googleai/gemini-2.0-flash-lite";

/**
 * Genkit-backed implementation of `LlmClient`. Uses Genkit's structured-output
 * support so each agent gets a value validated against its Zod schema.
 */
export function createGenkitClient(options: GenkitClientOptions = {}): LlmClient {
  const ai = genkit({
    plugins: [googleAI(options.apiKey ? { apiKey: options.apiKey } : {})],
    model: options.model ?? DEFAULT_MODEL,
  });

  return {
    async generate({ system, prompt, schema }) {
      const { output } = await ai.generate({
        system,
        prompt,
        output: { schema },
      });
      if (output == null) {
        throw new Error("Genkit returned no structured output for the requested schema.");
      }
      return output;
    },
  };
}
