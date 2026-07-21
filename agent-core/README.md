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
# Plus the SDK for whichever adapter you use (both are optional peer deps):
npm install @anthropic-ai/sdk         # for the Anthropic adapter
# npm install genkit @genkit-ai/googleai   # for the Genkit adapter
```

## Usage

The core is imported from the package root; each provider adapter has its own
subpath, so importing the core never pulls in a provider SDK.

```ts
import { createInterviewSystem } from "@product-agent/agent-core";
import { createAnthropicClient } from "@product-agent/agent-core/adapters/anthropic";
// or: import { createGenkitClient } from "@product-agent/agent-core/adapters/genkit";

const client = createAnthropicClient({ model: "claude-haiku-4-5" });
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

Two adapters ship in `adapters/` (Anthropic and Genkit), but any implementation
works — the raw SDKs, OpenAI, a local model, or a mock for tests. Both SDKs are
**optional peer dependencies**, each isolated to its own adapter file; the core
itself only depends on `zod`.

```
src/
  index.ts          public API (no provider SDK imported)
  types.ts          SessionState, Docs, TraceEvent, TurnResult
  llm.ts            LlmClient interface  (the provider seam)
  schema.ts         pod specs + the interviewer "avoid these mistakes" rubric
  pods.ts           the three specialist agents (one factory, run in parallel)
  interviewer.ts    supervisor: opening / next-question / closing
  orchestrator.ts   createInterviewSystem() — the per-turn loop
  adapters/
    anthropic.ts    Claude adapter (messages.parse + zodOutputFormat)
    genkit.ts       Genkit + Gemini adapter
```

## Develop

```bash
npm run test       # stub-client logic test — no model, no network
npm run typecheck  # tsc --noEmit
```

See [`../docs/DESIGN.md`](../docs/DESIGN.md) for the full architecture, the
research grounding, and how this fits the hosted demo.
