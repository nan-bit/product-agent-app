# Product Agent — Design Doc

> A conversational multi-agent system that interviews a "vibe coder" and, each turn,
> updates three living design documents — Product, Design, and Engineering — mimicking
> a real dev pod. Hosted as a live, embeddable demo on [ernan.dev](https://ernan.dev);
> its agent core is framework-free so anyone can grab it from GitHub and port it.

Status: **Shipped** — live at [ernan.dev/projects/product-agent](https://ernan.dev/projects/product-agent). Last updated: 2026-07-21.

---

## 1. Why this exists

Vibe coding can one-shot an app, but the result rarely survives contact with a real
product environment because the model was never given the context that traditional
software captures in specs — the *why*, the *for whom*, the constraints, the non-goals.
Spec-driven development fixes this, but writing specs is exactly what a vibe coder skips.

This app closes that gap by **conducting the interview for them**. A small team of agents
with distinct goals guides the user through dynamic questions and, turn by turn, fills in
the design documents that a disciplined team would have written anyway. The output is a
crisp, portable architecture the user (or a coding agent) can then build against.

The demo also *is* the argument: it shows the value of **agents with different goals
working together**. That collaboration must be visible, not hidden behind a spinner.

## 2. Goals and non-goals

**Goals**
- A polished, ephemeral, in-browser demo a stranger can try in ~2 minutes.
- Dynamic interview that extracts the *most useful* info from a non-technical/vibe-coder user.
- Three living docs (Product / Design / Engineering) updated **every turn**.
- Make the multi-agent collaboration legible in the UI (visible "dev pod").
- A **framework-free agent core** someone can fork from GitHub and reuse.
- Runs on a **hosted model** with strict cost/abuse controls.

**Non-goals (for this demo)**
- No accounts, no database, no persistence — each visitor gets a fresh session.
- No GitHub-repo ingestion, no epics/stories/tasks, no export to trackers.
  *(These remain a compelling future direction — see §11 — but are out of scope for the
  portfolio demo, where they would require auth and a real repo to be meaningful.)*
- No Privacy Design Document as a separate artifact. Privacy is treated as a cross-cutting
  concern the interviewer probes and records inside the relevant doc, keeping the pod to three.

## 3. End state

- **Hosted:** the agent server runs on **Firebase App Hosting** (Cloud Run under the hood),
  reachable at a subdomain (e.g. `agent.ernan.dev`) via Cloudflare DNS.
- **Embedded:** the UI lives natively inside the ernan.dev Astro portfolio as an interactive
  island on a project page — the same presentation pattern as the
  [watch-timegrapher](https://ernan.dev/projects/watch-timegrapher/) project (writeup +
  live embedded tool + link to source). The one architectural difference from the
  timegrapher: this tool cannot be 100% client-side, because it calls a model with a secret
  key — so the island calls a small hosted endpoint.
- **Portable:** the `agent-core` package is framework-free; the project page links straight
  to that folder so anyone can grab the agent bits.

## 4. Architecture — three decoupled layers

The current Next.js app fuses three concerns (brain + server + UI) into one framework.
We separate them so the brain is portable and the UI is native to the portfolio.

```
agent-core/     the portable brain — pure TypeScript, no web framework, no React, no HTTP.
                the pod + interviewer agents, the blackboard state machine, the interview
                strategy. Depends only on an LLM adapter (Claude behind an interface).
                Public API: runTurn(state, answer) -> { state, docs, trace, nextQuestion, turnsLeft }

server/         the thin brain host — imports agent-core, holds GOOGLE_API_KEY, exposes a
                single streaming endpoint (POST /turn). Rate limiting + turn budget live here.
                Deploys to Firebase App Hosting / Cloud Run.

web (portfolio) the face — a React island on the ernan.dev project page. Renders chat, the
                three live docs, and the visible agent trace. Calls /turn. Reuses the existing
                chat + doc components. (Lives in the ernan.dev repo, not here.)
```

Why this satisfies both drivers:
- **Portability** — the brain is a self-contained library with no framework entanglement.
- **Native embed** — the UI is an Astro island, matching the portfolio's existing pattern.

## 5. The multi-agent system

Pattern: **supervisor + blackboard**, the production-dominant shape for this kind of work.
The three documents are a shared blackboard; specialist agents write to it; a supervisor
chooses the next question. Updating three independent docs from one answer is low-coupling,
so the specialists run **in parallel**.

```
        ┌─────────── shared blackboard: PRD · Design Doc · EDD ───────────┐
        │                                                                  │
 user answer ─►  [ Product ]   [ Design ]   [ Engineering ]   ← 3 pod agents, IN PARALLEL
                     │             │              │             each: extract → update its
                     │             │              │             own doc → emit its top gap
                     └──────┬──────┴──────┬───────┘
                            ▼             ▼
                   ┌───────────────────────────────┐
                   │  Interviewer (supervisor)     │  reads the 3 gaps + coverage state,
                   │  completeness check +          │  picks the single highest-value next
                   │  next-question selection       │  question, phrases it for a vibe coder
                   └───────────────────────────────┘
                            │
                            ▼  one question, conversational
                         user
```

### Agents

**Core "pod" agents (3) — specialist writers.** Each owns exactly one document and one lens.
Each turn, in parallel, an agent reads the shared docs + the new answer, updates its own doc,
and reports its single biggest open gap.
- **Product** → Product Requirements (problem, audience, journey, key features, success metrics, non-goals).
- **Design** → Design/UX (brand & tone, core components, primary screen & primary action, accessibility).
- **Engineering** → Engineering Design (architecture, stack, data model, auth/security, deployment).

**Support agent (1) — the Interviewer / supervisor.** It:
1. runs a **completeness check** on the last answer (did it fill the gap? → probe vs. advance),
2. selects the next question by **information gain** over the pods' reported gaps + coverage deficits,
3. phrases it for a vibe coder and enforces the interview rules (see §6).

No separate "synthesizer" — the pod agents *are* the artifact writers. (A monolithic
synthesizer is what made the current app's docs thin: it only saw the latest extracted note.)

### Latency and cost

Per turn is **two model-calls deep**: the three pod writers run concurrently (one wall-clock
step), then the interviewer. That is *faster* than today's serial Analyst→Synthesizer→Strategist
(three deep), produces richer docs (three specialists vs. one), and is cheap on a small model.
The parallel pod step is also what we visualize as the "dev pod" reacting.

### Visibility (the demo's whole point)

`runTurn` returns a **trace**: what each pod extracted, which doc sections changed, each pod's
flagged gap, and why the interviewer chose the next question. The server streams these events
so the island can show the pod working live instead of a single "Thinking…" state.

## 6. Interview strategy (grounded in 2025 research)

The interviewer's next-question function scores candidates by:
1. **Coverage gap** — which of the three docs is thinnest (breadth before depth).
2. **Pod-reported value** — the specialists each name their biggest unknown every turn.
3. **Implicit-requirement probing** — deliberately surface what vibe coders skip: data model,
   auth, edge cases, scale, privacy, and explicit **non-goals**. (Current LLMs under-surface
   implicit requirements, so this must be active, not passive.)
4. **No repetition** — never re-ask covered ground; reflect the prior answer back so the user
   feels heard.

Additional rules, baked into the interviewer prompt as an explicit **"avoid these interviewer
mistakes"** rubric (this rubric measurably improves question quality):
- one question at a time — never double-barreled,
- open, not leading or closed,
- plain language, no jargon,
- concrete/scenario-based ("walk me through what a user does first"),
- always probe a vague answer before moving on,
- paraphrase the answer back to confirm understanding.

Use a **least-to-most** shape: start broad, then decompose into sharper sub-questions
(this outperformed zero-shot prompting for elicitation).

### The turn budget as a feature

Sessions are capped at a small budget (**4 turns**, matched by the per-IP cap). This is not only a
cost control — it forces **coverage-aware pacing**: because the pods develop all three docs every
turn, four focused exchanges land a genuinely usable spec, and the final turn fills the weakest doc
before the session ends gracefully — "here's your architecture; take it and build." A short,
bounded interview that lands a full spec is a better demo (and cheaper) than an open chat that
trails off. Bump `MAX_TURNS` for a deeper interview.

## 7. Documents

Three living Markdown docs, each owned by one pod agent:

| Doc | Owner | Core sections |
|-----|-------|---------------|
| Product Requirements (PRD) | Product | Problem, audience, user journey, key features, success metrics, non-goals |
| Design / UX | Design | Personality & tone, core components, primary screen & action, accessibility |
| Engineering Design (EDD) | Engineering | Architecture, stack, data model, auth/security, deployment |

The existing `masterSchema` "Top-5 per doc" question bank is a good starting seed for the
interviewer's coverage checklist; it is reframed from four docs to three and pointed at a
vibe-coder audience.

## 8. Tech decisions

- **Provider-agnostic core, one shipped adapter.** `agent-core` depends only on a thin `LlmClient`
  interface (structured output via Zod schemas); providers live behind a subpath adapter, so
  importing the core pulls in no provider SDK. It ships a **Claude** adapter (`messages.parse` +
  `zodOutputFormat`), which the server uses directly. This is the portability thesis made real — a
  new provider is a new adapter, nothing else changes. (An early Genkit/Gemini adapter was dropped
  once Claude was chosen.)
- **Hosted model.** Default `claude-sonnet-5` for rich, developed artifacts (adaptive thinking on
  by default); `claude-haiku-4-5` for cheapest/fastest, `claude-opus-4-8` for highest quality — one
  env var (`ANTHROPIC_MODEL`). Richness comes mostly from the pod prompts: the specialists are told
  to *develop* the idea (concrete detail, examples, labeled `Assumption:`/`Recommendation:`
  defaults) rather than transcribe it, which is what turned dry stubs into real drafts.
- **Streaming** the trace + doc updates (SSE / ReadableStream) so the pod appears to work live.
- **Ephemeral state** — the full session state round-trips through the client; no server storage.

## 9. Deployment & abuse controls

- Server on **Firebase App Hosting**; `GOOGLE_API_KEY` in Cloud Secret Manager, never in the repo
  or the browser.
- `agent.ernan.dev` custom domain via Cloudflare DNS. Note: set the subdomain to **DNS-only
  (grey cloud)** during Firebase certificate provisioning; Cloudflare's proxy can block cert issuance.
- **Abuse/cost controls** (all server-side):
  - **4 turns per IP** per rolling window, then the graceful "build it yourself" ending.
  - Per-IP rate limiting on the endpoint.
  - A global **daily spend kill-switch / alert** (turn budget caps compute, not tokens).
  - `maxInstances` kept low in `apphosting.yaml` to hard-cap concurrency.

## 10. Public interface (target)

```ts
// agent-core — framework-free, streamable
type Doc = { product: string; design: string; engineering: string };

type TraceEvent =
  | { agent: 'product' | 'design' | 'engineering'; extracted: string; sectionsChanged: string[]; gap: string }
  | { agent: 'interviewer'; completeness: 'complete' | 'incomplete'; rationale: string };

async function runTurn(
  state: SessionState,
  answer: string,
  opts?: { onTrace?: (e: TraceEvent) => void }
): Promise<{
  state: SessionState;
  docs: Doc;
  trace: TraceEvent[];
  nextQuestion: string;
  turnsLeft: number;
}>;
```

## 11. Out of scope now, compelling later

Captured so it isn't lost — but explicitly **not** in the demo:
- **Brownfield mode:** point at an existing GitHub repo; reverse-engineer the *as-is* EDD from
  the code so the interview only plans the delta.
- **Backlog generation:** map the docs to epics → stories → agent-executable tasks, each carrying
  a traceability link back to the design decision (and repo module) that justifies it — the
  "product-env context" bundle a coding agent is otherwise missing.
- **Export & sync:** push the backlog to GitHub Issues with status sync-back.
- **Durable projects:** accounts + persistence so work can be resumed and tasks checked off.

These need auth, storage, and a real repo, which fight the "quick portfolio demo" goal — so
they belong on the project-page "what's next" narrative, not in the live demo.

## 12. Decisions log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Demo scope = interview → 3 docs only; ephemeral | A stranger can try it in 2 min; no auth/DB |
| 2 | Three docs/agents: Product, Design, Engineering | Mimics a real dev pod; drops separate Privacy doc |
| 3 | Supervisor + blackboard MAS; pods write in parallel | Faster, crisper docs, visible collaboration |
| 4 | Interviewer drives dynamic questioning + completeness check | Adaptive, non-repetitive, extracts implicit reqs |
| 5 | 4 turns per IP, graceful ending | Cost cap doubles as coverage-forcing feature |
| 6 | Hosted cheap model, key server-side, rate-limited | Frictionless try; abuse/cost controlled |
| 7 | Decouple into agent-core / server / island | Portable brain + native portfolio embed |
| 8 | Provider-agnostic core via LlmClient; ships a Claude adapter | New provider = new adapter; the early Genkit/Gemini adapter was dropped once Claude was chosen |
| 9 | Retire Next.js | Its role (fused brain+server+UI) is replaced by the three layers |

## 13. Research references

- MetaGPT — role agents (PM/architect/engineer) coordinating through structured documents, not
  chat: [paper](https://arxiv.org/pdf/2308.00352), [overview](https://www.ibm.com/think/topics/metagpt)
- LLMREI — automating requirements-elicitation interviews; adaptive question flow; least-to-most
  beat zero-shot: [arxiv](https://arxiv.org/abs/2507.02564)
- Requirements-Elicitation Follow-Up Question Generation — guiding generation by common-mistake
  types improves question quality: [arxiv](https://arxiv.org/abs/2507.02858)
- ReqElicitGym — current LLMs under-surface *implicit* requirements: [arxiv](https://arxiv.org/html/2602.18306)
- The AI interviewer: adaptive questioning + completeness assessment:
  [Nature](https://www.nature.com/articles/s41598-026-46517-7)
- Multi-agent orchestration patterns (supervisor / blackboard / pipeline / swarm):
  [guide](https://www.augmentcode.com/guides/multi-agent-orchestration-architecture-guide)

## 14. Status — shipped

All four layers are built, tested, and deployed:

1. ✅ **`agent-core`** — the pod + interviewer loop, framework-free, Claude behind the `LlmClient`
   interface, trace exposed for streaming. Covered by a stub logic test + a live integration test.
2. ✅ **`server`** — streaming `/turn` (SSE) endpoint with per-IP turn limiting, on **Firebase App
   Hosting** (Cloud Run); `ANTHROPIC_API_KEY` from Secret Manager. HTTP-layer test with a fake system.
3. ✅ **Portfolio island** — full-viewport React island (chat + three live docs + an animated MAS
   flow), embedded on the ernan.dev project page; talks to the backend over SSE.
4. ✅ **Polish** — Sonnet 5 with develop-don't-transcribe prompts, a 4-turn coverage-aware budget,
   and the graceful ending.

### Deployment

- **Backend:** `https://product-agent--ernan-dev.us-central1.hosted.app` — Firebase App Hosting →
  Cloud Run (project `ernan-dev`, `maxInstances: 1`, model `claude-sonnet-5`, `master` branch CD).
  `agent.ernan.dev` is the intended custom domain.
- **Frontend:** the island on **[ernan.dev/projects/product-agent]** — Firebase Hosting, built with
  `PUBLIC_AGENT_URL` pointing at the backend; CORS locked to `ernan.dev`.
- **Caps:** 4 turns per IP, 30 requests/min per IP, and an answer-size limit — a full session runs
  a few cents; drop to `claude-haiku-4-5` (env) to make it near-free.

**Not shipped (still §11 future work):** brownfield repo ingestion, epics/stories/tasks, export to
trackers, durable projects.
