import fs from "fs-extra";
import path from "path";
import { z } from "zod";
import type { I18nConfig } from "./types.js";

const CONFIG_FILE_NAME = "i18n-pro.config.json";

const ConfigSchema = z.object({
  localesPath: z.string().min(1),
  defaultLocale: z.string().min(2),
  supportedLocales: z.array(z.string().min(2)),
  keyStyle: z.enum(["flat", "nested"]).default("nested"),
  usagePatterns: z.array(z.string()).default([]),
  autoSort: z.boolean().default(true)
});

function resolveConfigPath(): string {
  const cwd = process.cwd();
  return path.join(cwd, CONFIG_FILE_NAME);
}

export async function loadConfig(): Promise<I18nConfig> {
  const configPath = resolveConfigPath();

  if (!(await fs.pathExists(configPath))) {
    throw new Error(
      `Configuration file "${CONFIG_FILE_NAME}" not found in project root.\n` +
      `Run "i18n-pro init" to create one.`
    );
  }

  let rawConfig: unknown;

  try {
    rawConfig = await fs.readJson(configPath);
  } catch (err) {
    throw new Error(
      `Failed to parse ${CONFIG_FILE_NAME}. Ensure it contains valid JSON.`
    );
  }

  const parsed = ConfigSchema.safeParse(rawConfig);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map(e => `• ${e.path.join(".")}: ${e.message}`)
      .join("\n");

    throw new Error(
      `Invalid configuration in ${CONFIG_FILE_NAME}:\n${errors}`
    );
  }

  const config = parsed.data;

  validateConfigLogic(config);

  return config;
}

function validateConfigLogic(config: I18nConfig): void {
  if (!config.supportedLocales.includes(config.defaultLocale)) {
    throw new Error(
      `defaultLocale "${config.defaultLocale}" must be included in supportedLocales.`
    );
  }

  const duplicates = findDuplicates(config.supportedLocales);
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate locales found in supportedLocales: ${duplicates.join(", ")}`
    );
  }
}

function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.push(item);
    }
    seen.add(item);
  }

  return duplicates;
}