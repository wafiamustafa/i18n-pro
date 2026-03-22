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
  bundle: true,
  noExternal: [
    "chalk",
    "commander",
    "fs-extra",
    "glob",
    "inquirer",
    "iso-639-1",
    "leven",
    "openai",
    "zod",
    "@vitalets/google-translate-api",
  ],
});
