import chalk from "chalk";
import type { CommandContext } from "../context/types.js";
import {
  flattenObject,
  unflattenObject
} from "../core/object-utils.js";
import { validateNoStructuralConflict } from "../core/key-validator.js";
import { confirmAction } from "../core/confirmation.js";
import type { Translator } from "../providers/translator.js";

interface UpdateKeyOptions {
  value: string;
  locale?: string;
  sync?: boolean;
}

export async function updateKeyCommand(
  context: CommandContext,
  key: string,
  options: UpdateKeyOptions,
  translator?: Translator
): Promise<void> {
  const { config, fileManager, options: globalOptions } = context;
  const { yes, dryRun, ci } = globalOptions;

  const { value, locale } = options;

  if (!key || value === undefined) {
    throw new Error("Both key and --value are required.");
  }

  const targetLocale = locale ?? config.defaultLocale;
  const shouldSync = options.sync ?? false;

  if (!config.supportedLocales.includes(targetLocale)) {
    throw new Error(
      `Locale "${targetLocale}" is not defined in configuration.`
    );
  }

  // When syncing, we update all locales. Otherwise, just the target locale.
  const localesToUpdate = shouldSync
    ? config.supportedLocales
    : [targetLocale];

  console.log(chalk.cyan(`\nPreparing to update key:`));
  console.log(chalk.yellow(`  ${key}`));
  console.log(chalk.gray(`  Target locale: ${targetLocale}`));
  if (shouldSync) {
    console.log(chalk.gray(`  Sync mode: Will translate to all locales\n`));
  } else {
    console.log();
  }

  // Validate key exists in all target locales
  for (const loc of localesToUpdate) {
    const nested = await fileManager.readLocale(loc);
    const flat = flattenObject(nested);

    // Strict structural validation
    validateNoStructuralConflict(flat, key);

    if (flat[key] === undefined) {
      throw new Error(
        `Key "${key}" does not exist in locale "${loc}".`
      );
    }
  }

  // Read the target locale to show old value
  const targetNested = await fileManager.readLocale(targetLocale);
  const targetFlat = flattenObject(targetNested);

  console.log(
    chalk.white(
      `Old value: ${chalk.gray(JSON.stringify(targetFlat[key]))}`
    )
  );
  console.log(
    chalk.white(
      `New value: ${chalk.green(JSON.stringify(value))}`
    )
  );

  if (ci && !yes) {
    throw new Error(
      `CI mode: key "${key}" would be updated in ${localesToUpdate.length} locale(s). Re-run with --yes to apply.`
    );
  }

  const confirmed = await confirmAction(
    "\nDo you want to continue?",
    { skip: yes ?? false, ci: ci ?? false }
  );

  if (!confirmed) {
    console.log(chalk.red("\nOperation cancelled."));
    return;
  }

  // Translate value for non-target locales if syncing
  const translations: Record<string, string> = {
    [targetLocale]: value
  };

  if (shouldSync && translator) {
    for (const loc of config.supportedLocales) {
      if (loc === targetLocale) continue;

      try {
        const result = await translator.translate({
          text: value,
          targetLocale: loc,
          sourceLocale: targetLocale
        });
        translations[loc] = result.text;
      } catch (err) {
        console.log(
          chalk.yellow(
            `⚠ Warning: Failed to translate to "${loc}": ${(err as Error).message}`
          )
        );
        // Keep existing value if translation fails
        const nested = await fileManager.readLocale(loc);
        const flat = flattenObject(nested);
        translations[loc] = flat[key] as string;
      }
    }
  }

  // Update all locales
  for (const loc of localesToUpdate) {
    const nested = await fileManager.readLocale(loc);
    const flat = flattenObject(nested);

    flat[key] = translations[loc]!;

    const rebuilt =
      config.keyStyle === "nested"
        ? unflattenObject(flat)
        : flat;

    await fileManager.writeLocale(loc, rebuilt, {
      dryRun: dryRun ?? false
    });
  }

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.")
    );
  } else {
    if (shouldSync) {
      console.log(
        chalk.green(
          `\n✔ Successfully updated "${key}" in ${localesToUpdate.length} locale(s).`
        )
      );
    } else {
      console.log(
        chalk.green(
          `\n✔ Successfully updated "${key}" in ${targetLocale}.json`
        )
      );
    }
  }
}
