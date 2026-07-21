# Product Agent

**A multi-agent system that interviews you and writes the design docs spec-driven development needs.**

### ▶ Live demo — [ernan.dev/projects/product-agent](https://ernan.dev/projects/product-agent)

Vibe-coding can one-shot an app, but it skips the context that keeps software alive in a real
product environment — the *why*, the *for whom*, the constraints, the non-goals. Product Agent runs
that missing interview: a small pod of agents with different goals guides you through a short
conversation and, turn by turn, fills in the **Product**, **Design**, and **Engineering** documents
a disciplined team would have written anyway.

The demo *is* the argument — it makes a pod of agents with distinct goals collaborating *visible*.

## How it works

Each turn, one answer flows into a **supervisor + blackboard** loop:

- Three specialist agents — **Product**, **Design**, **Engineering** — run **in parallel**, each
  developing its own living document from your answer and reporting its biggest open gap.
- An **Interviewer** (supervisor) judges the answer's completeness, then picks the single
  highest-value next question, phrased for a non-technical founder.

It's grounded in 2025 requirements-elicitation research — adaptive questioning, an "avoid these
interviewer mistakes" rubric, and developing the idea rather than transcribing it. Full write-up and
citations in [`docs/DESIGN.md`](docs/DESIGN.md).

## Architecture

```
ernan.dev/projects/product-agent      (Astro + React island — in the portfolio repo)
        │  POST /turn  (Server-Sent Events)
        ▼
Firebase App Hosting → Cloud Run       (server/ — holds the key, per-IP turn budget)
        │  LlmClient → Claude adapter
        ▼
Claude Sonnet 5        ·  4-turn budget · per-IP rate limits · fresh, ephemeral session
```

## Layout

```
agent-core/   the portable brain — framework-free TypeScript. The pod + interviewer agents and the
              per-turn loop, behind an LlmClient interface (a Claude adapter is included). Grab this
              folder to reuse the multi-agent system anywhere.
server/       thin streaming host — one POST /turn (SSE) endpoint, per-IP turn budget, CORS.
              Deploys to Firebase App Hosting.
docs/         DESIGN.md — the spec, decisions, and research.
```

The **UI** is a React island that lives in the portfolio repo (`nan-bit/portfolio`), not here — it
calls the `server/` endpoint over SSE.

## Run locally

```bash
npm install --prefix agent-core     # zod + the Claude SDK
npm install --prefix server         # hono + agent-core (file:../agent-core)
cp server/.env.example server/.env  # then set ANTHROPIC_API_KEY
npm --prefix server run dev         # streams on :8080
```

`POST /turn` with `{}` starts a session; pass back `{ state, answer }` each turn. The response is a
Server-Sent Event stream — `trace` events per agent action, then a `result`.

## Test

```bash
npm --prefix agent-core test              # stub logic test — no model, no network
npm --prefix agent-core run test:anthropic   # live check (needs server/.env with a key)
npm --prefix server test                  # HTTP-layer test — fake system, no network
```

## Provider

The core is provider-agnostic behind a small `LlmClient` interface; the shipped adapter uses
**Claude** (`claude-sonnet-5` by default — set `ANTHROPIC_MODEL` to change; `claude-haiku-4-5` for
cheapest/fastest). Swapping providers means writing another adapter, nothing else changes.

## License

MIT
