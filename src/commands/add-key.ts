import chalk from "chalk";
import type { CommandContext } from "../context/types.js";
import { flattenObject, unflattenObject } from "../core/object-utils.js";
import { validateNoStructuralConflict } from "../core/key-validator.js";
import { confirmAction } from "../core/confirmation.js";
import type { Translator } from "../providers/translator.js";

export async function addKeyCommand(
  context: CommandContext,
  key: string,
  options: { value: string },
  translator: Translator
): Promise<void> {
  const { config, fileManager } = context;
  const { yes, dryRun, ci } = context.options;

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

  if (ci && !yes) {
    throw new Error(
      `CI mode: key "${key}" would be added to ${updatedLocales.length} locale(s). Re-run with --yes to apply.`
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

  // Translate value for non-default locales
  const translations: Record<string, string> = {
    [config.defaultLocale]: value
  };

  for (const locale of locales) {
    if (locale === config.defaultLocale) continue;

    try {
      const result = await translator.translate({
        text: value,
        targetLocale: locale,
        sourceLocale: config.defaultLocale
      });
      translations[locale] = result.text;
    } catch (err) {
      console.log(
        chalk.yellow(
          `⚠ Warning: Failed to translate to "${locale}": ${(err as Error).message}`
        )
      );
      translations[locale] = "";
    }
  }

  for (const locale of locales) {
    const nested = await fileManager.readLocale(locale);
    const flat = flattenObject(nested);

    flat[key] = translations[locale]!;

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
