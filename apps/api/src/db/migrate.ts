import { closeDb, dbKind, runMigrations } from "./client";

await runMigrations();
console.log(`Migrations applied (${dbKind}).`);
await closeDb();
