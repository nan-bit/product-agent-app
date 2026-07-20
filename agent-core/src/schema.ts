import type { PodKey } from "./types";

/** Static definition of a specialist pod agent: who it is and what its
 *  document should cover. Reframed from the original four-doc question bank to
 *  three docs, aimed at a non-technical "vibe coder" audience. */
export interface PodSpec {
  key: PodKey;
  docTitle: string;
  /** System-prompt persona for this specialist. */
  persona: string;
  /** The sections this document should cover when relevant (the coverage checklist). */
  sections: string[];
}

export const POD_SPECS: Record<PodKey, PodSpec> = {
  product: {
    key: "product",
    docTitle: "Product Requirements Document (PRD)",
    persona:
      "You are the Product lead in a small product-planning pod. You own the Product Requirements Document. You care about the real problem being solved, who it is for, the core user journey, the essential features, how success will be measured, and what is explicitly out of scope.",
    sections: [
      "Problem",
      "Target audience",
      "Core user journey",
      "Key features",
      "Success metrics",
      "Non-goals",
    ],
  },
  design: {
    key: "design",
    docTitle: "Design / UX Document",
    persona:
      "You are the Design lead in a small product-planning pod. You own the Design/UX document. You care about the product's personality and tone, its core reusable UI components, the layout of the main screen and its single most important action, and accessibility.",
    sections: [
      "Personality & tone",
      "Core components",
      "Main screen & primary action",
      "Accessibility",
    ],
  },
  engineering: {
    key: "engineering",
    docTitle: "Engineering Design Document (EDD)",
    persona:
      "You are the Engineering lead in a small product-planning pod. You own the Engineering Design Document. You care about the system architecture, the technology stack, the data model, authentication and security, and how the product is deployed and operated.",
    sections: [
      "Architecture",
      "Technology stack",
      "Data model",
      "Authentication & security",
      "Deployment & operations",
    ],
  },
};

/**
 * The rubric of common interviewer mistakes to AVOID, injected into the
 * Interviewer's system prompt. Guiding question generation by an explicit list
 * of mistakes measurably improves question quality (see docs/DESIGN.md, refs).
 */
export const INTERVIEWER_RUBRIC: string[] = [
  "Ask exactly ONE question at a time. Never bundle multiple questions together.",
  "Ask open questions, not leading or yes/no questions.",
  "Use plain language a non-technical founder understands. No jargon.",
  'Prefer concrete, scenario-based prompts ("walk me through what a user does first").',
  "If the last answer was vague or thin, probe THAT topic with a follow-up before moving on.",
  "Briefly reflect the user's previous answer back so they feel heard.",
  "Never re-ask something already covered.",
];
