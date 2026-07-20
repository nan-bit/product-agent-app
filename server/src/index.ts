import { serve } from "@hono/node-server";
import { loadConfig } from "./config";
import { buildAgentSystem } from "./agent";
import { createApp } from "./app";

const config = loadConfig();

if (!config.apiKey) {
  console.warn(
    "[server] No GEMINI_API_KEY / GOOGLE_API_KEY set — model calls will fail until a key is provided.",
  );
}

const system = buildAgentSystem(config);
const app = createApp({ system, config });

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[server] product-agent listening on :${info.port}`);
  console.log(
    `[server] model=${config.model} maxTurns=${config.maxTurns} ipTurnBudget=${config.ipTurnBudget}`,
  );
});
