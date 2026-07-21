# Product Agent

A conversational multi-agent system that interviews you and, turn by turn, writes the design
documents spec-driven development needs — **Product**, **Design**, and **Engineering** — the
context vibe-coding skips. It runs as a live demo embedded in [ernan.dev](https://ernan.dev).

Each turn, one answer flows into a **supervisor + blackboard** system: three specialist agents
(Product / Design / Engineering) run **in parallel**, each developing its own document, while an
**Interviewer** picks the single highest-value next question. See
[`docs/DESIGN.md`](docs/DESIGN.md) for the full architecture and the research behind it.

## Layout

```
agent-core/   the portable brain — framework-free TypeScript. The pod + interviewer agents and
              the per-turn loop. Depends only on an LlmClient interface (Claude adapter included).
              Grab this folder to reuse the multi-agent system anywhere.
server/       thin streaming host — one POST /turn (SSE) endpoint, per-IP turn budget, CORS.
              Deploys to Firebase App Hosting. Holds the API key server-side.
docs/         DESIGN.md — the spec, decisions, and references.
```

The **UI** is a React island that lives in the portfolio repo (`nan-bit/portfolio`), not here — it
calls the `server/` endpoint.

## Run locally

```bash
# 1. Install the core's deps (zod + the Claude SDK)
npm install --prefix agent-core

# 2. Install the server's deps
npm install --prefix server

# 3. Give the server a key
cp server/.env.example server/.env      # then set ANTHROPIC_API_KEY

# 4. Start it (streams on :8080)
npm --prefix server run dev
```

`POST /turn` with `{}` starts a session; pass back `{ state, answer }` each turn. The response is a
Server-Sent Event stream (`trace` events per agent action, then a `result`).

## Test

```bash
npm --prefix agent-core test            # stub logic test — no model, no network
npm --prefix agent-core run test:anthropic   # live check (needs server/.env with a key)
npm --prefix server test                # HTTP-layer test — fake system, no network
```

## Provider

The core is provider-agnostic behind a small `LlmClient` interface; the shipped adapter uses
**Claude** (`claude-sonnet-5` by default — set `ANTHROPIC_MODEL` to change). Swapping providers
means writing another adapter, nothing else.

## License

MIT
