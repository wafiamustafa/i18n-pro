import chalk from "chalk";
import type { CommandContext } from "../context/types.js";
import {
  flattenObject,
  unflattenObject
} from "../core/object-utils.js";
import { validateNoStructuralConflict } from "../core/key-validator.js";
import { confirmAction } from "../core/confirmation.js";

interface UpdateKeyOptions {
  value: string;
  locale?: string;
}

export async function updateKeyCommand(
  context: CommandContext,
  key: string,
  options: UpdateKeyOptions
): Promise<void> {
  const { config, fileManager, options: globalOptions } = context;
  const { yes, dryRun, ci } = globalOptions;

  const { value, locale } = options;

  if (!key || value === undefined) {
    throw new Error("Both key and --value are required.");
  }

  const targetLocale = locale ?? config.defaultLocale;

  if (!config.supportedLocales.includes(targetLocale)) {
    throw new Error(
      `Locale "${targetLocale}" is not defined in configuration.`
    );
  }

  console.log(chalk.cyan(`\nPreparing to update key:`));
  console.log(chalk.yellow(`  ${key}`));
  console.log(chalk.gray(`  Locale: ${targetLocale}\n`));

  const nested = await fileManager.readLocale(targetLocale);
  const flat = flattenObject(nested);

  // Strict structural validation
  validateNoStructuralConflict(flat, key);

  if (flat[key] === undefined) {
    throw new Error(
      `Key "${key}" does not exist in locale "${targetLocale}".`
    );
  }

  console.log(
    chalk.white(
      `Old value: ${chalk.gray(JSON.stringify(flat[key]))}`
    )
  );
  console.log(
    chalk.white(
      `New value: ${chalk.green(JSON.stringify(value))}`
    )
  );

  if (ci && !yes) {
    throw new Error(
      `CI mode: key "${key}" in "${targetLocale}" would be updated. Re-run with --yes to apply.`
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

  flat[key] = value;

  const rebuilt =
    config.keyStyle === "nested"
      ? unflattenObject(flat)
      : flat;

  await fileManager.writeLocale(targetLocale, rebuilt, {
    dryRun: dryRun ?? false
  });

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.")
    );
  } else {
    console.log(
      chalk.green(
        `\n✔ Successfully updated "${key}" in ${targetLocale}.json`
      )
    );
  }
}
