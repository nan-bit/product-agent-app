import type { z } from "zod";

/**
 * The single seam between agent-core and any model provider.
 *
 * agent-core never imports a provider SDK directly — it only asks an `LlmClient`
 * to turn a prompt into a value matching a Zod schema. Implement this interface
 * to plug in any backend (a Claude adapter ships in `adapters/anthropic.ts`; a
 * raw-SDK or mock implementation works just as well). This is what keeps the
 * "brain" portable.
 */
export interface GenerateRequest<T extends z.ZodTypeAny = z.ZodTypeAny> {
  /** System instruction: the agent's role and standing rules. */
  system?: string;
  /** The turn-specific prompt (state, question, answer). */
  prompt: string;
  /** Zod schema describing the structured output; the result is validated against it. */
  schema: T;
}

export interface LlmClient {
  generate<T extends z.ZodTypeAny>(request: GenerateRequest<T>): Promise<z.infer<T>>;
}
