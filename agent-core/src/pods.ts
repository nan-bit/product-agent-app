import { z } from "zod";
import type { LlmClient } from "./llm";
import type { PodKey, QATurn } from "./types";
import { POD_SPECS } from "./schema";

/** Structured output every pod specialist returns each turn. */
const PodOutputSchema = z.object({
  updatedDoc: z
    .string()
    .describe(
      'The FULL updated Markdown document, integrating any new information from the latest answer. Keep all still-valid existing content; only revise what changed. Organize content under clear "##" section headings.',
    ),
  extracted: z
    .string()
    .describe(
      "One or two sentences summarizing what you learned from the user's latest answer that is relevant to YOUR document. If nothing was relevant, say so plainly.",
    ),
  sectionsChanged: z
    .array(z.string())
    .describe("The names of the sections you added or modified this turn (empty array if none)."),
  gap: z
    .string()
    .describe(
      "The single most valuable piece of information you still need for your document, phrased as a short topic.",
    ),
});

export type PodResult = z.infer<typeof PodOutputSchema> & { key: PodKey };

function recentHistory(history: QATurn[], n = 6): string {
  const recent = history.slice(-n);
  if (recent.length === 0) return "(no prior conversation)";
  return recent.map((h) => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");
}

/**
 * Run one specialist pod agent. Each reads only its OWN document plus the shared
 * conversation, updates that document from the latest answer, and reports its
 * biggest remaining gap. Pods are independent, so the orchestrator runs all
 * three in parallel.
 */
export async function runPod(
  client: LlmClient,
  key: PodKey,
  currentDoc: string,
  question: string,
  answer: string,
  history: QATurn[],
): Promise<PodResult> {
  const spec = POD_SPECS[key];

  const system = [
    spec.persona,
    "",
    `Your document is the ${spec.docTitle}. Cover these sections when the conversation supports them: ${spec.sections.join(", ")}.`,
    "You work in parallel with the other pod leads. Write ONLY your own document, not theirs.",
    "Never invent facts the user did not provide. Leave a section sparse rather than fabricating detail.",
  ].join("\n");

  const prompt = [
    "Recent conversation:",
    recentHistory(history),
    "",
    "The user was just asked:",
    `"${question}"`,
    "",
    "And answered:",
    `"${answer}"`,
    "",
    "Here is the CURRENT version of your document:",
    '"""',
    currentDoc || "(empty so far)",
    '"""',
    "",
    "Update your document to incorporate anything relevant from the latest answer, then report what you extracted, which sections changed, and your single biggest remaining information gap.",
  ].join("\n");

  const output = await client.generate({ system, prompt, schema: PodOutputSchema });
  return { key, ...output };
}
