export type Provider = "anthropic" | "genkit";

export interface ServerConfig {
  port: number;
  /** Which LLM adapter to use. */
  provider: Provider;

  // Anthropic (default provider)
  anthropicApiKey?: string;
  anthropicModel: string;

  // Genkit / Gemini (alternate provider)
  googleApiKey?: string;
  genkitModel: string;

  /** Max output tokens per model call. */
  maxOutputTokens: number;

  /** Turn budget of a single interview session. */
  maxTurns: number;
  /** Total answer-turns one IP may spend per window before the demo cuts off. */
  ipTurnBudget: number;
  /** Rolling window length for the per-IP turn budget, in ms. */
  ipWindowMs: number;
  /** Simple per-IP request rate limit. */
  requestsPerMinute: number;
  /** Max characters accepted in a single answer. */
  maxAnswerChars: number;
  /** Origins allowed by CORS; empty means allow all (dev only). */
  allowedOrigins: string[];
}

type Env = Record<string, string | undefined>;

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && value !== undefined && value !== "" ? n : fallback;
}

function list(value: string | undefined): string[] {
  return value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

export function loadConfig(env: Env = process.env): ServerConfig {
  const provider: Provider = env.LLM_PROVIDER === "genkit" ? "genkit" : "anthropic";
  return {
    port: num(env.PORT, 8080),
    provider,

    anthropicApiKey: env.ANTHROPIC_API_KEY,
    anthropicModel: env.ANTHROPIC_MODEL ?? "claude-haiku-4-5",

    googleApiKey: env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY,
    genkitModel: env.AGENT_MODEL ?? "googleai/gemini-2.0-flash-lite",

    maxOutputTokens: num(env.MAX_OUTPUT_TOKENS, 16000),

    maxTurns: num(env.MAX_TURNS, 10),
    ipTurnBudget: num(env.IP_TURN_BUDGET, 10),
    ipWindowMs: num(env.IP_WINDOW_MS, 24 * 60 * 60 * 1000),
    requestsPerMinute: num(env.REQUESTS_PER_MINUTE, 30),
    maxAnswerChars: num(env.MAX_ANSWER_CHARS, 4000),
    allowedOrigins: list(env.ALLOWED_ORIGINS),
  };
}

/** Whether the API key for the selected provider is present. */
export function hasProviderKey(config: ServerConfig): boolean {
  return config.provider === "anthropic" ? !!config.anthropicApiKey : !!config.googleApiKey;
}
