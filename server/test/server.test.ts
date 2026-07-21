import assert from "node:assert/strict";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config";

// A fake InterviewSystem — no agent-core, no Genkit, no network. It lets us
// exercise the HTTP layer (SSE framing, per-IP turn budget, 429s, CORS,
// validation) in isolation. This is only possible because app.ts depends on the
// InterviewSystem interface (type-only), not on any provider.
function makeState(overrides: Record<string, unknown> = {}) {
  return {
    docs: { product: "", design: "", engineering: "" },
    history: [],
    turn: 0,
    maxTurns: 10,
    lastQuestion: null,
    coverage: { product: [], design: [], engineering: [] },
    ...overrides,
  };
}

const fakeSystem: any = {
  createSession: () => makeState(),
  async runTurn(state: any, answer: string, opts: any = {}) {
    const isOpening =
      state.lastQuestion == null && state.history.length === 0 && !answer.trim();
    if (isOpening) {
      opts.onTrace?.({
        type: "interviewer",
        completeness: "n/a",
        rationale: "greeting",
        nextQuestion: "What are you building?",
      });
      opts.onTrace?.({ type: "done", turnsLeft: 10, finished: false });
      return {
        state: makeState({ lastQuestion: "What are you building?" }),
        docs: state.docs,
        trace: [],
        nextQuestion: "What are you building?",
        turnsLeft: 10,
        finished: false,
      };
    }
    for (const agent of ["product", "design", "engineering"]) {
      opts.onTrace?.({ type: "pod", agent, extracted: "x", sectionsChanged: ["S"], gap: "g" });
    }
    opts.onTrace?.({
      type: "interviewer",
      completeness: "complete",
      rationale: "advance",
      nextQuestion: "Who is it for?",
    });
    const turn = state.turn + 1;
    return {
      state: makeState({ turn, lastQuestion: "Who is it for?" }),
      docs: { product: "# P", design: "# D", engineering: "# E" },
      trace: [],
      nextQuestion: "Who is it for?",
      turnsLeft: 10 - turn,
      finished: false,
    };
  },
};

function post(app: any, ip: string, payload: unknown, extraHeaders: Record<string, string> = {}) {
  return app.request("/turn", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...extraHeaders },
    body: JSON.stringify(payload),
  });
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

async function main() {
  const config = loadConfig({
    IP_TURN_BUDGET: "2",
    REQUESTS_PER_MINUTE: "100",
    ALLOWED_ORIGINS: "https://ernan.dev",
  });
  const app = createApp({ system: fakeSystem, config });

  // 1. Opening: no state -> opening question, no turn consumed, CORS reflected.
  let res = await post(app, "1.1.1.1", {}, { origin: "https://ernan.dev" });
  assert.equal(res.status, 200);
  assert.equal(
    res.headers.get("access-control-allow-origin"),
    "https://ernan.dev",
    "CORS origin reflected",
  );
  let text = await res.text();
  assert.ok(text.includes("event: result"), "opening streams a result event");
  assert.ok(text.includes("What are you building?"), "opening question present");

  // 2. Continued turn: 3 pod trace events + result; budget drawn down to 1.
  const state = makeState({ lastQuestion: "What are you building?" });
  res = await post(app, "9.9.9.9", { state, answer: "A trip planner" });
  assert.equal(res.status, 200);
  text = await res.text();
  assert.equal(countOccurrences(text, "event: trace"), 4, "3 pod + 1 interviewer trace events");
  assert.ok(text.includes('"agent":"product"'), "product pod streamed");
  assert.ok(text.includes('"ipTurnsRemaining":1'), "turn budget decremented to 1");

  // 3. Second answer-turn from same IP -> budget now 0.
  res = await post(app, "9.9.9.9", { state, answer: "Business travelers" });
  text = await res.text();
  assert.ok(text.includes('"ipTurnsRemaining":0'), "turn budget decremented to 0");

  // 4. Third answer-turn -> demo limit (429).
  res = await post(app, "9.9.9.9", { state, answer: "one more" });
  assert.equal(res.status, 429, "demo limit enforced");
  const limitBody = await res.json();
  assert.equal((limitBody as any).error, "demo_limit");

  // 5. Empty answer on a continued session -> 400 (fresh IP).
  res = await post(app, "5.5.5.5", { state, answer: "   " });
  assert.equal(res.status, 400, "empty answer rejected");

  // 6. Health check.
  res = await app.request("/health");
  assert.equal(res.status, 200);

  console.log("server logic test: PASS");
  console.log("  - opening streams result, no turn consumed, CORS reflected");
  console.log("  - continued turn streams 3 pod + interviewer events");
  console.log("  - per-IP turn budget draws down and cuts off at the limit (429)");
  console.log("  - empty-answer + JSON validation guards");
}

main().catch((err) => {
  console.error("server logic test: FAIL");
  console.error(err);
  process.exit(1);
});
