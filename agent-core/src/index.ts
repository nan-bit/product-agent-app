// Public API. Import the orchestrator + types from here; the Genkit adapter is
// also re-exported for convenience but is optional (it pulls in the genkit peer
// deps). To stay fully framework-free, import from "./orchestrator" and supply
// your own LlmClient.

export { createInterviewSystem } from "./orchestrator";
export type { InterviewSystem } from "./orchestrator";

export { createGenkitClient } from "./adapters/genkit";
export type { GenkitClientOptions } from "./adapters/genkit";

export { POD_SPECS, INTERVIEWER_RUBRIC } from "./schema";
export type { PodSpec } from "./schema";

export { POD_KEYS } from "./types";
export type {
  Docs,
  PodKey,
  QATurn,
  RunTurnOptions,
  SessionState,
  TraceEvent,
  TurnResult,
} from "./types";

export type { GenerateRequest, LlmClient } from "./llm";
