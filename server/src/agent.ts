// The only server file that constructs the real (Genkit-backed) system.
// Kept separate from app.ts so the HTTP layer stays provider-agnostic.
import {
  createGenkitClient,
  createInterviewSystem,
  type InterviewSystem,
} from "@product-agent/agent-core";
import type { ServerConfig } from "./config";

export function buildAgentSystem(config: ServerConfig): InterviewSystem {
  const client = createGenkitClient({ apiKey: config.apiKey, model: config.model });
  return createInterviewSystem(client, { maxTurns: config.maxTurns });
}
