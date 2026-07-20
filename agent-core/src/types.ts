// Core data model for the interview system. Framework-free by design.

/** The three documents (and the three specialist agents that own them). */
export type PodKey = "product" | "design" | "engineering";

export const POD_KEYS: PodKey[] = ["product", "design", "engineering"];

/** The blackboard: three living Markdown documents. */
export interface Docs {
  product: string;
  design: string;
  engineering: string;
}

/** One question/answer exchange. */
export interface QATurn {
  question: string;
  answer: string;
}

/** The full, serializable session state. Callers persist this between turns
 *  (in this demo it round-trips through the client — no server storage). */
export interface SessionState {
  docs: Docs;
  history: QATurn[];
  /** Number of user answers processed so far. */
  turn: number;
  /** Turn budget for the session. */
  maxTurns: number;
  /** The question the user is currently answering (null before the opening). */
  lastQuestion: string | null;
  /** Section names touched per document, used for coverage-aware questioning. */
  coverage: Record<PodKey, string[]>;
}

/** Streamed during a turn so the UI can show the pod working live. */
export type TraceEvent =
  | {
      type: "pod";
      agent: PodKey;
      /** What this specialist learned from the latest answer. */
      extracted: string;
      /** Sections it added or changed this turn. */
      sectionsChanged: string[];
      /** Its single biggest remaining information gap. */
      gap: string;
    }
  | {
      type: "interviewer";
      /** Whether the last answer was judged complete ("n/a" for opening/closing). */
      completeness: "complete" | "incomplete" | "n/a";
      rationale: string;
      /** The next question, or the closing message when finished. */
      nextQuestion: string;
    }
  | { type: "done"; turnsLeft: number; finished: boolean };

/** The result of a single turn. */
export interface TurnResult {
  state: SessionState;
  docs: Docs;
  trace: TraceEvent[];
  /** The next question to show the user, or the closing message if finished. */
  nextQuestion: string;
  turnsLeft: number;
  /** True when the interview has reached its budget and gracefully ended. */
  finished: boolean;
}

export interface RunTurnOptions {
  /** Called as each trace event is produced, for streaming to a UI. */
  onTrace?: (event: TraceEvent) => void;
}
