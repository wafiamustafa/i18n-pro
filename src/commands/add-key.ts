import chalk from "chalk";
import type { CommandContext } from "../context/types.js";
import { flattenObject, unflattenObject } from "../core/object-utils.js";
import { validateNoStructuralConflict } from "../core/key-validator.js";
import { confirmAction } from "../core/confirmation.js";

export async function addKeyCommand(
  context: CommandContext,
  key: string,
  options: { value: string }
): Promise<void> {
  const { config, fileManager } = context;
  const { yes, dryRun } = context.options;

  const value = options.value;

  if (!key || !value) {
    throw new Error("Both key and --value are required.");
  }

  const locales = config.supportedLocales;

  console.log(chalk.cyan(`\nPreparing to add key:`));
  console.log(chalk.yellow(`  ${key}\n`));

  const updatedLocales: string[] = [];

  for (const locale of locales) {
    const nested = await fileManager.readLocale(locale);
    const flat = flattenObject(nested);

    // Strict mode validation
    validateNoStructuralConflict(flat, key);

    if (flat[key] !== undefined) {
      throw new Error(
        `Key "${key}" already exists in locale "${locale}". Use update:key instead.`
      );
    }

    updatedLocales.push(locale);
  }

  console.log(chalk.white("This operation will update:"));
  updatedLocales.forEach(l =>
    console.log(chalk.gray(`  • ${l}.json`))
  );

  const confirmed = await confirmAction(
    "\nDo you want to continue?",
    { skip: yes ?? false }
  );

  if (!confirmed) {
    console.log(chalk.red("\nOperation cancelled."));
    return;
  }

  for (const locale of locales) {
    const nested = await fileManager.readLocale(locale);
    const flat = flattenObject(nested);

    flat[key] = locale === config.defaultLocale ? value : "";

    const finalData =
      config.keyStyle === "nested"
        ? unflattenObject(flat)
        : flat;

    await fileManager.writeLocale(locale, finalData, { dryRun: dryRun ?? false });
  }

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.")
    );
  } else {
    updatedLocales.forEach(l =>
      console.log(chalk.green(`✔ Updated ${l}.json`))
    );

    console.log(
      chalk.green("\n✨ Key added successfully across all locales.")
    );
  }
}