import type { LlmClient } from "./llm";
import type {
  Docs,
  PodKey,
  RunTurnOptions,
  SessionState,
  TraceEvent,
  TurnResult,
} from "./types";
import { POD_KEYS } from "./types";
import { runPod } from "./pods";
import { generateClosing, generateOpening, runInterviewer } from "./interviewer";

const DEFAULT_MAX_TURNS = 4;

function emptyDocs(): Docs {
  return { product: "", design: "", engineering: "" };
}

function emptyCoverage(): Record<PodKey, string[]> {
  return { product: [], design: [], engineering: [] };
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

export interface InterviewSystem {
  /** A fresh, empty session with the configured turn budget. */
  createSession(): SessionState;
  /**
   * Advance the interview by one turn.
   * - First call (empty state, empty answer): returns the opening question only.
   * - Otherwise: records the answer, runs the three pods in parallel, then either
   *   asks the next question or, if the budget is spent, returns the closing message.
   */
  runTurn(state: SessionState, answer: string, options?: RunTurnOptions): Promise<TurnResult>;
}

export function createInterviewSystem(
  client: LlmClient,
  options: { maxTurns?: number } = {},
): InterviewSystem {
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;

  function createSession(): SessionState {
    return {
      docs: emptyDocs(),
      history: [],
      turn: 0,
      maxTurns,
      lastQuestion: null,
      coverage: emptyCoverage(),
    };
  }

  async function runTurn(
    state: SessionState,
    answer: string,
    { onTrace }: RunTurnOptions = {},
  ): Promise<TurnResult> {
    const trace: TraceEvent[] = [];
    const emit = (event: TraceEvent) => {
      trace.push(event);
      onTrace?.(event);
    };

    const isOpening =
      state.lastQuestion == null && state.history.length === 0 && !answer.trim();

    // --- Opening turn: nothing to process, just produce the first question. ---
    if (isOpening) {
      const opening = await generateOpening(client);
      const nextState: SessionState = { ...state, lastQuestion: opening.nextQuestion };
      const turnsLeft = Math.max(0, nextState.maxTurns - nextState.turn);
      emit({
        type: "interviewer",
        completeness: "n/a",
        rationale: opening.rationale,
        nextQuestion: opening.nextQuestion,
      });
      emit({ type: "done", turnsLeft, finished: false });
      return {
        state: nextState,
        docs: nextState.docs,
        trace,
        nextQuestion: opening.nextQuestion,
        turnsLeft,
        finished: false,
      };
    }

    // --- Normal turn ---
    const question = state.lastQuestion ?? "(unprompted)";
    const history = [...state.history, { question, answer }];
    const turn = state.turn + 1;

    // 1. Pod specialists run in parallel; each updates its own document.
    const podResults = await Promise.all(
      POD_KEYS.map(async (key) => {
        const result = await runPod(client, key, state.docs[key], question, answer, history);
        emit({
          type: "pod",
          agent: key,
          extracted: result.extracted,
          sectionsChanged: result.sectionsChanged,
          gap: result.gap,
        });
        return result;
      }),
    );

    // 2. Merge updated docs and coverage onto the blackboard.
    const docs: Docs = { ...state.docs };
    const coverage: Record<PodKey, string[]> = { ...state.coverage };
    const gaps: { agent: PodKey; gap: string }[] = [];
    for (const r of podResults) {
      docs[r.key] = r.updatedDoc;
      coverage[r.key] = uniq([...(coverage[r.key] ?? []), ...r.sectionsChanged]);
      gaps.push({ agent: r.key, gap: r.gap });
    }

    const turnsLeft = Math.max(0, maxTurns - turn);
    const nextStateBase: SessionState = {
      ...state,
      docs,
      coverage,
      history,
      turn,
      lastQuestion: null,
    };

    // 3a. Budget spent -> graceful close.
    if (turnsLeft <= 0) {
      const closing = await generateClosing(client, gaps);
      emit({
        type: "interviewer",
        completeness: "complete",
        rationale: closing.rationale,
        nextQuestion: closing.message,
      });
      emit({ type: "done", turnsLeft, finished: true });
      return {
        state: nextStateBase,
        docs,
        trace,
        nextQuestion: closing.message,
        turnsLeft,
        finished: true,
      };
    }

    // 3b. Otherwise choose the next question.
    const decision = await runInterviewer(client, nextStateBase, gaps, history, turnsLeft);
    const nextState: SessionState = { ...nextStateBase, lastQuestion: decision.nextQuestion };
    emit({
      type: "interviewer",
      completeness: decision.completeness,
      rationale: decision.rationale,
      nextQuestion: decision.nextQuestion,
    });
    emit({ type: "done", turnsLeft, finished: false });

    return {
      state: nextState,
      docs,
      trace,
      nextQuestion: decision.nextQuestion,
      turnsLeft,
      finished: false,
    };
  }

  return { createSession, runTurn };
}
