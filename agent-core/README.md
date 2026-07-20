# @product-agent/agent-core

The **portable brain** of Product Agent — a framework-free multi-agent system that
interviews a user and maintains three living design documents. No web framework,
no HTTP, no UI. Grab this folder, give it an `LlmClient`, and drive it from anywhere.

## What it does

Each turn, one answer flows into a **supervisor + blackboard** system:

- Three specialist **pod agents** — Product, Design, Engineering — run **in parallel**,
  each updating its own Markdown document and reporting its biggest information gap.
- An **Interviewer** (supervisor) judges the last answer, then picks the single
  highest-value next question, phrased for a non-technical "vibe coder."

The result is three documents that get crisper every turn, plus a **trace** of what
each agent did — so a UI can show the pod working live.

## Install

```bash
npm install zod
# Optional, only if you use the bundled Genkit adapter:
npm install genkit @genkit-ai/googleai
```

## Usage

```ts
import { createInterviewSystem, createGenkitClient } from "@product-agent/agent-core";

const client = createGenkitClient({ model: "googleai/gemini-2.0-flash-lite" });
const agent = createInterviewSystem(client, { maxTurns: 10 });

let state = agent.createSession();

// First call returns the opening question (no answer, no turn consumed):
let turn = await agent.runTurn(state, "");
console.log(turn.nextQuestion);
state = turn.state;

// Then feed each user answer back in:
turn = await agent.runTurn(state, "An app that helps freelancers invoice clients.", {
  onTrace: (e) => console.log(e), // stream pod/interviewer events to your UI
});
console.log(turn.docs.product, turn.docs.design, turn.docs.engineering);
console.log(turn.nextQuestion, "turns left:", turn.turnsLeft);

// ...continue until turn.finished === true (budget spent -> graceful close).
```

`runTurn` returns `{ state, docs, trace, nextQuestion, turnsLeft, finished }`.
The `state` is plain, serializable JSON — persist it however you like (this demo
round-trips it through the client; nothing is stored server-side).

## Bring your own model / provider

The only thing agent-core needs from a model is this interface:

```ts
interface LlmClient {
  generate<T extends z.ZodTypeAny>(request: {
    system?: string;
    prompt: string;
    schema: T;
  }): Promise<z.infer<T>>;
}
```

The shipped `createGenkitClient` implements it with Genkit + Gemini, but any
implementation works — the raw Google SDK, OpenAI, a local model, or a mock for
tests. Genkit is a **peer dependency**; the core itself only depends on `zod`.

```
src/
  index.ts          public API
  types.ts          SessionState, Docs, TraceEvent, TurnResult
  llm.ts            LlmClient interface  (the provider seam)
  schema.ts         pod specs + the interviewer "avoid these mistakes" rubric
  pods.ts           the three specialist agents (one factory, run in parallel)
  interviewer.ts    supervisor: opening / next-question / closing
  orchestrator.ts   createInterviewSystem() — the per-turn loop
  adapters/
    genkit.ts       the ONLY file that imports Genkit
```

## Develop

```bash
npm run test       # stub-client logic test — no model, no network
npm run typecheck  # tsc --noEmit
```

See [`../docs/DESIGN.md`](../docs/DESIGN.md) for the full architecture, the
research grounding, and how this fits the hosted demo.
