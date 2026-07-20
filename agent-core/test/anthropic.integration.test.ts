// Live integration check against the real Anthropic API. Runs the opening turn
// plus one answer turn on claude-haiku-4-5 (override with ANTHROPIC_MODEL) and
// prints the agent trace + the three generated docs.
//
//   Requires a real key. It is NOT part of the offline test suite (that's
//   logic.test.ts, which uses a stub and needs no network).
//
//   Run:  tsx --env-file=../server/.env test/anthropic.integration.test.ts
//     or: ANTHROPIC_API_KEY=sk-ant-... tsx test/anthropic.integration.test.ts
import { createInterviewSystem } from "../src/orchestrator";
import { createAnthropicClient } from "../src/adapters/anthropic";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("anthropic integration test: SKIPPED (set ANTHROPIC_API_KEY to run)");
    return;
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
  console.log(`anthropic integration test: provider=anthropic model=${model}\n`);

  const client = createAnthropicClient({ model });
  const agent = createInterviewSystem(client, { maxTurns: 10 });
  let state = agent.createSession();

  console.log("=== OPENING ===");
  let r = await agent.runTurn(state, "");
  console.log("Q:", r.nextQuestion, "\n");
  state = r.state;

  console.log("=== TURN 1 (real answer) ===");
  r = await agent.runTurn(
    state,
    "I want to build an app that helps freelance designers send invoices and track which clients have paid.",
    {
      onTrace: (e) => {
        if (e.type === "pod") {
          console.log(`  [${e.agent}] changed [${e.sectionsChanged.join(", ")}] | gap: ${e.gap}`);
        } else if (e.type === "interviewer") {
          console.log(`  [interviewer] completeness=${e.completeness}`);
        }
      },
    },
  );

  console.log("\nNext Q:", r.nextQuestion);
  console.log(`turnsLeft=${r.turnsLeft} finished=${r.finished}\n`);
  console.log("----- PRODUCT -----\n" + r.docs.product + "\n");
  console.log("----- DESIGN -----\n" + r.docs.design + "\n");
  console.log("----- ENGINEERING -----\n" + r.docs.engineering + "\n");

  if (!(r.docs.product && r.docs.design && r.docs.engineering && r.nextQuestion)) {
    throw new Error("a document or the next question came back empty");
  }
  console.log("anthropic integration test: PASS");
}

main().catch((e) => {
  const detail = e?.status ? `HTTP ${e.status} ${e?.error?.type ?? ""}` : e?.message || e;
  console.error("anthropic integration test: FAIL —", detail);
  process.exit(1);
});
