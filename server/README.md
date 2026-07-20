# @product-agent/server

The thin hosted **brain host** for [`agent-core`](../agent-core). One streaming
endpoint, the per-IP turn budget, and CORS — nothing else. Holds the Gemini key
server-side so the portfolio island never sees it.

## Endpoint

### `POST /turn`

Request body:

```jsonc
// Opening (start a session): omit state.
{}

// Continued turn: pass the state from the previous response plus the new answer.
{ "state": { /* SessionState from the last result event */ }, "answer": "..." }
```

Response: `text/event-stream` (SSE).

- `event: trace` — one per agent action as it happens (pods + interviewer), for
  showing the pod work live.
- `event: result` — the final payload: `{ state, docs, nextQuestion, turnsLeft, finished, ipTurnsRemaining }`.
- `event: error` — `{ message }` if the turn failed.

State is ephemeral and client-held: the client sends back the `state` it got in
the previous `result`. Nothing is stored server-side.

Also: `GET /health` → `{ ok: true }`.

## Abuse & cost controls

- **Per-IP turn budget** (`IP_TURN_BUDGET`, default 10) over a rolling window
  (`IP_WINDOW_MS`, default 24h). One full interview per IP; then a friendly 429
  telling the visitor to take their architecture and build it. The opening call
  is free (doesn't draw down the budget).
- **Request throttle** (`REQUESTS_PER_MINUTE`, default 30) per IP.
- **Answer size cap** (`MAX_ANSWER_CHARS`, default 4000).
- In-memory, correct for a single instance (keep `maxInstances` low). Swap the
  Map in `ratelimit.ts` for Firestore/Redis to scale out.

## Configuration

Copy `.env.example` to `.env`. Key vars: `GEMINI_API_KEY` (secret), `AGENT_MODEL`,
`ALLOWED_ORIGINS` (lock to your portfolio), `MAX_TURNS`, and the limits above.

## Run

```bash
npm install          # installs agent-core (file:../agent-core) + genkit + hono
npm run dev          # tsx watch, listens on :8080
npm test             # HTTP-layer test — fake system, no model, no network
npm run build        # tsup bundle (inlines agent-core, genkit stays external)
npm start            # node dist/index.js
```

## Deploy (Firebase App Hosting)

1. Point an App Hosting backend at this `server/` directory (build: `npm run build`,
   start: `npm start`, listens on `$PORT`).
2. Store `GEMINI_API_KEY` in Cloud Secret Manager and reference it from the
   backend config — never commit it.
3. Add the custom domain `agent.ernan.dev`; create the DNS record at Cloudflare
   **DNS-only (grey cloud)** until Firebase provisions the TLS cert.
4. Set `ALLOWED_ORIGINS=https://ernan.dev` so only the portfolio can call it.

## Design

`app.ts` (HTTP, provider-agnostic — imports agent-core *types only*) · `agent.ts`
(builds the real Genkit-backed system) · `ratelimit.ts` · `config.ts` · `index.ts`
(entry). See [`../docs/DESIGN.md`](../docs/DESIGN.md).
