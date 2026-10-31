import { serve } from "@hono/node-server";
import { env } from "./env";
import { app } from "./app";
import { dbKind, runMigrations } from "./db/client";

// Apply pending migrations on boot so a fresh Railway deploy is ready without a manual step.
await runMigrations();

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Lasan Family API listening on http://localhost:${info.port} (db: ${dbKind})`);
});
