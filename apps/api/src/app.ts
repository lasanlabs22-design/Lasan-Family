import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { BRAND } from "@lasan/shared";
import { env } from "./env";
import { dbKind } from "./db/client";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { customerRoutes } from "./routes/customer";
import { providerRoutes } from "./routes/provider";
import { publicRoutes } from "./routes/public";

export const app = new Hono();

app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

app.get("/", (c) => c.json({ name: `${BRAND.name} API`, version: "v1" }));
app.get("/health", (c) => c.json({ ok: true, db: dbKind }));

app.route("/v1", publicRoutes);
app.route("/v1/auth", authRoutes);
app.route("/v1/me", customerRoutes);
app.route("/v1/provider", providerRoutes);
app.route("/v1/admin", adminRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error(err);
  return c.json({ error: "Something went wrong on our side. Please try again." }, 500);
});
