import { defineConfig } from "tsup";

// Bundle the server to a single ESM file. agent-core (workspace source) is
// inlined via noExternal; the SDKs stay external and are installed at runtime.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  noExternal: ["@product-agent/agent-core"],
  external: ["@anthropic-ai/sdk", "hono", "@hono/node-server", "zod"],
  clean: true,
});
