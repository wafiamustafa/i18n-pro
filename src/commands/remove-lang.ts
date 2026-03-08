import chalk from "chalk";
import type { CommandContext } from "../context/types.js";
import { confirmAction } from "../core/confirmation.js";

export async function removeLangCommand(
  context: CommandContext,
  lang: string
): Promise<void> {
  const { config, fileManager, options } = context;
  const { yes, dryRun } = options;

  const locale = lang.trim();

  // Validate locale exists
  if (!config.supportedLocales.includes(locale)) {
    throw new Error(
      `Locale "${locale}" is not in supportedLocales.`
    );
  }

  // Prevent removing default locale
  if (locale === config.defaultLocale) {
    throw new Error(
      `Cannot remove default locale "${locale}". ` +
      `Change defaultLocale first.`
    );
  }

  // Check if file exists
  const exists = await fileManager.localeExists(locale);
  if (!exists) {
    throw new Error(
      `Locale file "${locale}.json" does not exist.`
    );
  }

  console.log(chalk.cyan(`\nPreparing to remove locale:`));
  console.log(chalk.yellow(`  ${locale}\n`));

  const confirmed = await confirmAction(
    `This will permanently delete "${locale}.json". Continue?`,
    { skip: yes ?? false }
  );

  if (!confirmed) {
    console.log(chalk.red("\nOperation cancelled."));
    return;
  }

  // Delete the locale file
  await fileManager.deleteLocale(locale, { dryRun: dryRun ?? false });

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.")
    );
  } else {
    console.log(
      chalk.green(`\n✔ Locale "${locale}" removed successfully.`)
    );
    console.log(
      chalk.gray(
        `Note: Remove "${locale}" from supportedLocales in config manually.`
      )
    );
  }
}