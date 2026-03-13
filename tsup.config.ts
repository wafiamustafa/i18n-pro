import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin/cli.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  shims: true,
});
