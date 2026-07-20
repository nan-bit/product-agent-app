import { serve } from "@hono/node-server";
import { hasProviderKey, loadConfig } from "./config";
import { buildAgentSystem } from "./agent";
import { createApp } from "./app";

const config = loadConfig();

if (!hasProviderKey(config)) {
  const keyName = config.provider === "anthropic" ? "ANTHROPIC_API_KEY" : "GEMINI_API_KEY";
  console.warn(`[server] No ${keyName} set — model calls will fail until a key is provided.`);
}

const system = await buildAgentSystem(config);
const app = createApp({ system, config });

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[server] product-agent listening on :${info.port}`);
  console.log(
    `[server] provider=${config.provider} model=${
      config.provider === "anthropic" ? config.anthropicModel : config.genkitModel
    } maxTurns=${config.maxTurns} ipTurnBudget=${config.ipTurnBudget}`,
  );
});
