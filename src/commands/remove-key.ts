import chalk from "chalk";
import type { CommandContext } from "../context/types.js";
import {
  flattenObject,
  unflattenObject,
  removeEmptyObjects
} from "../core/object-utils.js";
import { confirmAction } from "../core/confirmation.js";

export async function removeKeyCommand(
  context: CommandContext,
  key: string
): Promise<void> {
  const { config, fileManager, options } = context;
  const { yes, dryRun, ci } = options;

  if (!key) {
    throw new Error("Key is required.");
  }

  const locales = config.supportedLocales;

  console.log(chalk.cyan(`\nPreparing to remove key:`));
  console.log(chalk.yellow(`  ${key}\n`));

  const localesContainingKey: string[] = [];

  // First pass: check existence
  for (const locale of locales) {
    const nested = await fileManager.readLocale(locale);
    const flat = flattenObject(nested);

    if (flat[key] !== undefined) {
      localesContainingKey.push(locale);
    }
  }

  if (localesContainingKey.length === 0) {
    throw new Error(
      `Key "${key}" does not exist in any locale.`
    );
  }

  console.log(chalk.white("This operation will update:"));
  localesContainingKey.forEach(l =>
    console.log(chalk.gray(`  • ${l}.json`))
  );

  if (ci && !yes) {
    throw new Error(
      `CI mode: key "${key}" would be removed from ${localesContainingKey.length} locale(s). Re-run with --yes to apply.`
    );
  }

  const confirmed = await confirmAction(
    "\nThis will remove the key from ALL locales. Continue?",
    yes !== undefined ? { skip: yes, ci: ci ?? false } : { ci: ci ?? false }
  );

  if (!confirmed) {
    console.log(chalk.red("\nOperation cancelled."));
    return;
  }

  // Second pass: remove
  for (const locale of locales) {
    const nested = await fileManager.readLocale(locale);
    const flat = flattenObject(nested);

    if (flat[key] !== undefined) {
      delete flat[key];
    }

    const rebuilt =
      config.keyStyle === "nested"
        ? removeEmptyObjects(unflattenObject(flat))
        : flat;

    await fileManager.writeLocale(locale, rebuilt, dryRun !== undefined ? { dryRun } : undefined);
  }

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.")
    );
  } else {
    localesContainingKey.forEach(l =>
      console.log(chalk.green(`✔ Updated ${l}.json`))
    );

    console.log(
      chalk.green("\n✨ Key removed successfully from all locales.")
    );
  }
}
