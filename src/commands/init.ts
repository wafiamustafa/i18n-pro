import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { CONFIG_FILE_NAME, compileUsagePatterns } from "../config/config-loader.js";
import type { KeyStyle } from "../config/types.js";
import type { GlobalOptions } from "../context/types.js";
import { confirmAction } from "../core/confirmation.js";

interface InitConfigFile {
  localesPath: string;
  defaultLocale: string;
  supportedLocales: string[];
  keyStyle: KeyStyle;
  usagePatterns: string[];
  autoSort: boolean;
}

const DEFAULT_USAGE_PATTERNS = [
  "t\\(['\"](.*?)['\"]\\)",
  "translate\\(['\"](.*?)['\"]\\)",
  "i18n\\.t\\(['\"](.*?)['\"]\\)"
];

export async function initCommand(
  options: GlobalOptions
): Promise<void> {
  const { yes, dryRun, ci, force } = options;
  const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);
  const configExists = await fs.pathExists(configPath);

  if (configExists && !force) {
    throw new Error(
      `Configuration file "${CONFIG_FILE_NAME}" already exists. ` +
      `Use --force to overwrite.`
    );
  }

  const canPrompt = process.stdout.isTTY && !yes && !ci;

  let config: InitConfigFile;

  if (canPrompt) {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "localesPath",
        message: "Locales directory",
        default: "./locales",
        validate: (input: string) =>
          input.trim().length > 0 || "Please provide a locales path."
      },
      {
        type: "input",
        name: "defaultLocale",
        message: "Default locale",
        default: "en",
        validate: (input: string) =>
          input.trim().length >= 2 || "Default locale must be at least 2 characters."
      },
      {
        type: "input",
        name: "supportedLocales",
        message: "Supported locales (comma-separated)",
        default: (answers: { defaultLocale: string }) =>
          answers.defaultLocale
      },
      {
        type: "list",
        name: "keyStyle",
        message: "Key style",
        choices: ["nested", "flat"],
        default: "nested"
      },
      {
        type: "confirm",
        name: "autoSort",
        message: "Auto-sort keys?",
        default: true
      },
      {
        type: "confirm",
        name: "useDefaultUsagePatterns",
        message: "Use default usagePatterns?",
        default: true
      }
    ]);

    let usagePatterns: string[] = DEFAULT_USAGE_PATTERNS;

    if (!answers.useDefaultUsagePatterns) {
      usagePatterns = [];
      let addMore = true;

      while (addMore) {
        const { pattern } = await inquirer.prompt([
          {
            type: "input",
            name: "pattern",
            message: "Add usage pattern (regex)",
            validate: (input: string) =>
              input.trim().length > 0 || "Pattern cannot be empty."
          }
        ]);

        usagePatterns.push(pattern.trim());

        const { again } = await inquirer.prompt([
          {
            type: "confirm",
            name: "again",
            message: "Add another pattern?",
            default: false
          }
        ]);

        addMore = again;
      }
    }

    const supportedLocales = parseLocales(
      answers.supportedLocales
    );

    config = {
      localesPath: answers.localesPath.trim(),
      defaultLocale: answers.defaultLocale.trim(),
      supportedLocales,
      keyStyle: answers.keyStyle,
      usagePatterns,
      autoSort: answers.autoSort
    };
  } else {
    config = {
      localesPath: "./locales",
      defaultLocale: "en",
      supportedLocales: ["en"],
      keyStyle: "nested",
      usagePatterns: DEFAULT_USAGE_PATTERNS,
      autoSort: true
    };
  }

  config.supportedLocales = normalizeLocales(
    config.supportedLocales,
    config.defaultLocale
  );

  compileUsagePatterns(config.usagePatterns);

  if (ci && !yes) {
    const action = configExists ? "overwritten" : "created";
    throw new Error(
      `CI mode: configuration file would be ${action}. Re-run with --yes to apply.`
    );
  }

  if (configExists && !yes) {
    const confirmed = await confirmAction(
      `This will overwrite "${CONFIG_FILE_NAME}". Continue?`,
      { skip: false, ci: ci ?? false }
    );

    if (!confirmed) {
      console.log(chalk.red("\nOperation cancelled."));
      return;
    }
  }

  if (dryRun) {
    console.log(chalk.yellow("\n[DRY RUN] Configuration not written."));
    return;
  }

  await fs.writeJson(configPath, config, { spaces: 2 });

  await maybeInitLocales(config, { dryRun: false });

  console.log(
    chalk.green(`\n✔ Created ${CONFIG_FILE_NAME} successfully.`)
  );
}

function parseLocales(input: string): string[] {
  return input
    .split(",")
    .map(locale => locale.trim())
    .filter(Boolean);
}

function normalizeLocales(
  locales: string[],
  defaultLocale: string
): string[] {
  const unique = new Set<string>();

  for (const locale of locales) {
    if (locale.length > 0) {
      unique.add(locale);
    }
  }

  if (!unique.has(defaultLocale)) {
    unique.add(defaultLocale);
  }

  return Array.from(unique);
}

async function maybeInitLocales(
  config: InitConfigFile,
  options: { dryRun: boolean }
): Promise<void> {
  const localesPath = path.resolve(
    process.cwd(),
    config.localesPath
  );

  if (options.dryRun) {
    return;
  }

  await fs.ensureDir(localesPath);

  const defaultLocaleFile = path.join(
    localesPath,
    `${config.defaultLocale}.json`
  );

  if (await fs.pathExists(defaultLocaleFile)) {
    return;
  }

  await fs.writeJson(defaultLocaleFile, {}, { spaces: 2 });
}
