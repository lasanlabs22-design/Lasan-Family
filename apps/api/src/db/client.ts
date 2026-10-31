import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { env } from "../env";
import * as schema from "./schema";

const migrationsFolder = resolve(import.meta.dirname, env.NODE_ENV === "production" ? "../drizzle" : "../../drizzle");

function connect() {
  if (env.DATABASE_URL) {
    // Railway Postgres. Railway's public proxy needs TLS; the private network does not.
    const pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      ssl: /railway\.internal/.test(env.DATABASE_URL) || /localhost|127\.0\.0\.1/.test(env.DATABASE_URL) ? undefined : { rejectUnauthorized: false },
      max: 10,
    });
    const db = drizzlePg(pool, { schema });
    return { db, kind: "postgres" as const, migrate: () => migratePg(db, { migrationsFolder }), close: () => pool.end() };
  }
  // Local development without a database server: embedded Postgres persisted to apps/api/.pglite
  const dir = resolve(import.meta.dirname, "../../.pglite");
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzlePglite(client, { schema });
  return { db, kind: "pglite" as const, migrate: () => migratePglite(db, { migrationsFolder }), close: () => client.close() };
}

const conn = connect();

// Both drivers expose the same query builder; type everything against node-postgres.
export const db = conn.db as unknown as ReturnType<typeof drizzlePg<typeof schema>>;
export const dbKind = conn.kind;
export const runMigrations = conn.migrate;
export const closeDb = conn.close;
export { schema };
