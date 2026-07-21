import assert from "node:assert/strict";
import { createInterviewSystem } from "../src/orchestrator";
import type { LlmClient } from "../src/llm";
import type { TraceEvent } from "../src/types";

// A stub LlmClient that inspects the requested Zod schema's shape and returns
// canned structured output. This exercises the full orchestration loop — opening
// branch, parallel pod updates, coverage/turn bookkeeping, trace emission, and
// the graceful budget ending — with no model and no network. It is possible only
// because agent-core depends on the LlmClient interface, not on Genkit.
const stub: LlmClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generate({ schema }: any) {
    const keys = Object.keys(schema?.shape ?? {});
    if (keys.includes("updatedDoc")) {
      return {
        updatedDoc: "# Doc\n\n## Section\nSome captured content.",
        extracted: "Captured something relevant.",
        sectionsChanged: ["Section"],
        gap: "a remaining topic",
      } as never;
    }
    if (keys.includes("message")) {
      return {
        rationale: "wrapping up",
        message: "Your three documents are ready. Take them and build.",
      } as never;
    }
    if (keys.includes("nextQuestion")) {
      return {
        completeness: "complete",
        rationale: "moving to the thinnest document",
        nextQuestion: "Who is this product for?",
        targetDoc: "product",
      } as never;
    }
    throw new Error("stub: unrecognized schema with keys " + keys.join(","));
  },
};

async function main() {
  const sys = createInterviewSystem(stub, { maxTurns: 3 });
  let state = sys.createSession();
  assert.equal(state.turn, 0);
  assert.equal(state.lastQuestion, null);

  // Opening: produces a question, consumes no turn, docs still empty.
  let r = await sys.runTurn(state, "");
  assert.ok(r.nextQuestion.length > 0, "opening question produced");
  assert.equal(r.finished, false);
  assert.equal(r.turnsLeft, 3);
  assert.equal(r.docs.product, "");
  assert.equal(r.state.lastQuestion, r.nextQuestion, "opening question stored for next turn");
  state = r.state;

  // Turn 1: pods update all three docs; trace carries 3 pod + interviewer + done.
  const traces: TraceEvent[] = [];
  r = await sys.runTurn(state, "It helps people plan trips.", {
    onTrace: (e) => traces.push(e),
  });
  assert.ok(
    r.docs.product.length > 0 && r.docs.design.length > 0 && r.docs.engineering.length > 0,
    "all three docs updated",
  );
  assert.equal(r.turnsLeft, 2);
  assert.equal(r.finished, false);
  assert.equal(traces.filter((e) => e.type === "pod").length, 3, "three pod trace events");
  assert.ok(traces.some((e) => e.type === "interviewer"), "an interviewer trace event");
  assert.equal(r.state.history.length, 1, "history recorded");
  assert.deepEqual(r.state.coverage.product, ["Section"], "coverage merged");
  state = r.state;

  // Turn 2.
  r = await sys.runTurn(state, "Mostly frequent business travelers.");
  assert.equal(r.turnsLeft, 1);
  assert.equal(r.finished, false);
  state = r.state;

  // Turn 3: hits the budget -> graceful close.
  r = await sys.runTurn(state, "Success = repeat weekly users.");
  assert.equal(r.turnsLeft, 0);
  assert.equal(r.finished, true, "interview finishes at the budget");
  assert.ok(r.nextQuestion.length > 0, "closing message present");
  assert.ok(
    r.trace.some((e) => e.type === "done" && e.finished),
    "done event marks finished",
  );

  console.log("agent-core logic test: PASS");
  console.log("  - opening question produced, no turn consumed");
  console.log("  - three pods updated docs in parallel (3 trace events)");
  console.log("  - coverage + history tracked; turn budget decremented");
  console.log("  - graceful finish at the turn limit");
}

main().catch((err) => {
  console.error("agent-core logic test: FAIL");
  console.error(err);
  process.exit(1);
});
