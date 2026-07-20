import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
// Type-only import: erased at build time, so the HTTP layer never pulls in
// Genkit. The real system is injected; tests inject a fake one.
import type { InterviewSystem, SessionState } from "@product-agent/agent-core";
import type { ServerConfig } from "./config";
import { createRateLimiter } from "./ratelimit";

export interface AppDeps {
  system: InterviewSystem;
  config: ServerConfig;
  /** Injectable clock for the rate limiter (tests). */
  now?: () => number;
}

function clientIp(c: Context): string {
  const xff = c.req.header("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return c.req.header("x-real-ip") ?? "unknown";
}

export function createApp({ system, config, now }: AppDeps): Hono {
  const app = new Hono();
  const limiter = createRateLimiter({
    turnBudget: config.ipTurnBudget,
    windowMs: config.ipWindowMs,
    requestsPerMinute: config.requestsPerMinute,
    now,
  });

  app.use(
    "*",
    cors({
      origin: config.allowedOrigins.length ? config.allowedOrigins : "*",
      allowMethods: ["POST", "GET", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  app.get("/health", (c) => c.json({ ok: true }));

  app.post("/turn", async (c) => {
    const ip = clientIp(c);

    // Cheap per-IP request throttle (guards even the free opening call).
    const rl = limiter.checkRequest(ip);
    if (!rl.ok) {
      return c.json(
        { error: "rate_limited", message: "Too many requests. Please slow down." },
        429,
      );
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "bad_request", message: "Invalid JSON body." }, 400);
    }

    const answer = typeof (body as any)?.answer === "string" ? (body as any).answer : "";
    const incomingState = (body as any)?.state ?? null;

    if (answer.length > config.maxAnswerChars) {
      return c.json(
        { error: "too_long", message: `Answer exceeds ${config.maxAnswerChars} characters.` },
        413,
      );
    }

    // New session (opening question) vs. a continued answer-turn.
    const isOpening = incomingState == null;
    let state: SessionState;

    if (isOpening) {
      state = system.createSession();
    } else {
      state = incomingState as SessionState;
      if (!answer.trim()) {
        return c.json({ error: "empty_answer", message: "Please provide an answer." }, 400);
      }
      // Real turns draw down the per-IP budget; the opening does not.
      if (!limiter.consumeTurn(ip)) {
        return c.json(
          {
            error: "demo_limit",
            message:
              "You've reached the demo limit. Take your architecture and build it — the code is on GitHub.",
            turnsRemaining: 0,
          },
          429,
        );
      }
    }

    // Stream the turn as Server-Sent Events. onTrace fires synchronously from
    // agent-core, so we serialize the async writes through a chain and flush
    // before the stream closes.
    return streamSSE(c, async (stream) => {
      let chain: Promise<unknown> = Promise.resolve();
      const enqueue = (event: string, data: unknown) => {
        chain = chain.then(() => stream.writeSSE({ event, data: JSON.stringify(data) }));
      };

      try {
        const result = await system.runTurn(state, isOpening ? "" : answer, {
          onTrace: (event) => enqueue("trace", event),
        });
        enqueue("result", {
          state: result.state,
          docs: result.docs,
          nextQuestion: result.nextQuestion,
          turnsLeft: result.turnsLeft,
          finished: result.finished,
          ipTurnsRemaining: limiter.turnsRemaining(ip),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        enqueue("error", { message });
      }

      await chain;
    });
  });

  return app;
}
