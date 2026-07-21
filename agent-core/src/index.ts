// Public API — the framework-free core. Import the orchestrator, types, and the
// LlmClient interface from here. The provider adapter lives behind a subpath
// export (`@product-agent/agent-core/adapters/anthropic`) so importing the core
// never pulls in a provider SDK — you only load the adapter you actually import.

export { createInterviewSystem } from "./orchestrator";
export type { InterviewSystem } from "./orchestrator";

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
