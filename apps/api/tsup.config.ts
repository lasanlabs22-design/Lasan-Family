import { defineConfig } from "tsup";

// Bundles the API and the workspace @lasan/shared source into dist/; npm deps stay external.
export default defineConfig({
  entry: ["src/index.ts", "src/db/migrate.ts", "src/db/seed.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  noExternal: ["@lasan/shared"],
});
