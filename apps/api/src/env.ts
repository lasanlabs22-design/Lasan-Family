import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().optional().default(""),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001,http://localhost:8081"),
  FIREBASE_PROJECT_ID: z.string().optional().default(""),
  AUTH_DEV_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  // Comma-separated demo accounts (E.164) that may sign in with OTP 123456 even in production, e.g. for app-store review.
  DEMO_PHONES: z
    .string()
    .optional()
    .default("")
    .transform((v) =>
      v
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    ),
  ADMIN_EMAIL: z.string().email().default("admin@lasanfamily.in"),
  ADMIN_PASSWORD: z.string().min(6).default("change-me-now"),
});

const parsed = schema.safeParse({
  ...process.env,
  JWT_SECRET: process.env.JWT_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "dev-only-secret-not-for-production"),
});

if (!parsed.success) {
  console.error("Invalid environment:", z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;

if (env.NODE_ENV === "production" && env.AUTH_DEV_MODE) {
  console.error("AUTH_DEV_MODE must be false in production.");
  process.exit(1);
}
