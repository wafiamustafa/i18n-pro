import chalk from "chalk";
import ISO6391 from "iso-639-1";
import type { CommandContext } from "../context/types.js";
import { confirmAction } from "../core/confirmation.js";

interface AddLangOptions {
  from?: string;
  strict?: boolean;
}

function isValidLocale(code: string): boolean {
  // Accept en or en-US format
  const parts = code.split("-");

  if (parts.length === 1) {
    return ISO6391.validate(parts[0]!);
  }

  if (parts.length === 2) {
    return ISO6391.validate(parts[0]!);
  }

  return false;
}

export async function addLang(
  lang: string,
  options: AddLangOptions,
  context: CommandContext
): Promise<void> {
  const { config, fileManager } = context;
  const { yes, dryRun } = context.options;

  const locale = lang.trim();

  if (!isValidLocale(locale)) {
    throw new Error(`Invalid language code: ${locale}`);
  }

  if (config.supportedLocales.includes(locale)) {
    throw new Error(`Language ${locale} already exists`);
  }

  const exists = await fileManager.localeExists(locale);
  if (exists) {
    throw new Error(`File already exists: ${locale}.json`);
  }

  let baseContent: Record<string, unknown> = {};

  // If clone from existing locale
  if (options.from) {
    const baseLocale = options.from;

    if (!config.supportedLocales.includes(baseLocale)) {
      throw new Error(`Base locale ${baseLocale} does not exist`);
    }

    baseContent = await fileManager.readLocale(baseLocale);
  }

  console.log(chalk.cyan(`\nPreparing to add locale:`));
  console.log(chalk.yellow(`  ${locale}\n`));

  const confirmed = await confirmAction(
    `This will create new locale "${locale}". Continue?`,
    { skip: yes ?? false }
  );

  if (!confirmed) {
    console.log(chalk.red("\nOperation cancelled."));
    return;
  }

  await fileManager.createLocale(locale, baseContent, { dryRun: dryRun ?? false });

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.")
    );
  } else {
    console.log(
      chalk.green(`\n✔ Locale "${locale}" created successfully.`)
    );
    console.log(
      chalk.gray(
        `Note: Add "${locale}" to supportedLocales in config manually.`
      )
    );
  }
}