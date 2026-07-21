import { z } from "zod";
import type { LlmClient } from "./llm";
import type { PodKey, QATurn, SessionState } from "./types";
import { POD_KEYS } from "./types";
import { INTERVIEWER_RUBRIC, POD_SPECS } from "./schema";

/** The Interviewer's decision each turn: judge the last answer, choose the next question. */
const InterviewerOutputSchema = z.object({
  completeness: z
    .enum(["complete", "incomplete"])
    .describe("Did the user's latest answer sufficiently address what was asked?"),
  rationale: z
    .string()
    .describe("Brief reasoning: why this next question is the highest-value one to ask right now."),
  nextQuestion: z
    .string()
    .describe(
      "The single next question to ask, phrased conversationally. If the last answer was incomplete, make this a targeted follow-up on the SAME topic; otherwise advance to the highest-value unexplored area.",
    ),
  targetDoc: z
    .enum(["product", "design", "engineering"])
    .describe("Which document this question is primarily meant to advance."),
});
export type InterviewerDecision = z.infer<typeof InterviewerOutputSchema>;

const OpeningOutputSchema = z.object({
  completeness: z.enum(["complete", "incomplete"]).describe('Always "incomplete" for the opening.'),
  rationale: z.string().describe("Why you are opening with this question."),
  nextQuestion: z
    .string()
    .describe("A warm, broad opening question that invites the user to describe their product idea."),
  targetDoc: z.enum(["product", "design", "engineering"]),
});

const ClosingOutputSchema = z.object({
  rationale: z.string().describe("Why the interview is wrapping up."),
  message: z
    .string()
    .describe(
      "A friendly closing message telling the user the interview is complete and their three design documents are ready to take and build from.",
    ),
});
export type ClosingResult = z.infer<typeof ClosingOutputSchema>;

const BASE_SYSTEM = [
  'You are the Interviewer, the supervisor of a product-planning pod. You guide a non-technical "vibe coder" through a focused interview so that three living documents get filled in: a Product Requirements Document, a Design/UX document, and an Engineering Design Document.',
  "",
  "Rules you must always follow:",
  ...INTERVIEWER_RUBRIC.map((r) => `- ${r}`),
  "",
  "Vibe coders volunteer features but skip the unglamorous essentials. Actively probe for the things they leave implicit: the data model, authentication, edge cases, scale, privacy, and explicit non-goals.",
  "Draw out specifics — if an answer is vague or generic, ask for a concrete example, a real scenario, or a number. The richer the user's answers, the richer the documents.",
  "Favor breadth before depth: make sure all three documents are usable before exploring any one of them deeply.",
].join("\n");

function coverageSummary(state: SessionState): string {
  return POD_KEYS.map((key) => {
    const spec = POD_SPECS[key];
    const touched = new Set(state.coverage[key] ?? []);
    const covered = spec.sections.filter((s) => touched.has(s));
    const missing = spec.sections.filter((s) => !touched.has(s));
    return [
      spec.docTitle,
      `  covered: ${covered.join(", ") || "nothing yet"}`,
      `  missing: ${missing.join(", ") || "all covered"}`,
    ].join("\n");
  }).join("\n");
}

function recentHistory(history: QATurn[], n = 8): string {
  const recent = history.slice(-n);
  if (recent.length === 0) return "(none)";
  return recent.map((h) => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");
}

/** Generate the opening question (no answer to process yet). */
export async function generateOpening(client: LlmClient) {
  return client.generate({
    system: BASE_SYSTEM,
    prompt:
      "The interview is just starting. Ask a single warm, broad opening question that invites the user to describe the product they want to build.",
    schema: OpeningOutputSchema,
  });
}

/** Choose the next question given the updated docs and each pod's reported gap. */
export async function runInterviewer(
  client: LlmClient,
  state: SessionState,
  gaps: { agent: PodKey; gap: string }[],
  history: QATurn[],
  turnsLeft: number,
): Promise<InterviewerDecision> {
  const last = history[history.length - 1];
  const nearEnd =
    turnsLeft <= 1
      ? "This is the final question of the interview. Ask the single thing that most improves the weakest document so all three are usable."
      : "";

  const prompt = [
    `Turns remaining in this interview: ${turnsLeft}. ${nearEnd}`,
    "",
    "Document coverage so far:",
    coverageSummary(state),
    "",
    "Each pod lead just reported the single biggest gap in their document:",
    ...gaps.map((g) => `- ${POD_SPECS[g.agent].docTitle}: ${g.gap}`),
    "",
    "Most recent exchange:",
    last ? `Q: ${last.question}\nA: ${last.answer}` : "(none)",
    "",
    "Earlier conversation (context only, do not repeat these):",
    recentHistory(history.slice(0, -1)),
    "",
    "First judge whether the last answer was complete. Then choose the single highest-value next question, weighing: which document is thinnest (breadth first), the gaps the pods reported, and the implicit essentials vibe coders tend to skip.",
  ].join("\n");

  return client.generate({ system: BASE_SYSTEM, prompt, schema: InterviewerOutputSchema });
}

/** Produce the graceful closing message when the turn budget is spent. */
export async function generateClosing(
  client: LlmClient,
  gaps: { agent: PodKey; gap: string }[],
): Promise<ClosingResult> {
  const prompt = [
    "The interview has reached its turn limit. Write a short, friendly closing message.",
    "Tell the user their three design documents (Product, Design, Engineering) are ready to take and build from.",
    "If some areas are still thin, mention them briefly as things to flesh out while building.",
    "",
    "Remaining gaps the pods flagged:",
    ...gaps.map((g) => `- ${POD_SPECS[g.agent].docTitle}: ${g.gap}`),
  ].join("\n");

  return client.generate({ system: BASE_SYSTEM, prompt, schema: ClosingOutputSchema });
}
