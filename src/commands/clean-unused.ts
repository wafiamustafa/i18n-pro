import fs from "fs-extra";
import { glob } from "glob";
import chalk from "chalk";
import { flattenObject, unflattenObject } from "../core/object-utils.js";
import { confirmAction } from "../core/confirmation.js";
import type { CommandContext } from "../context/types.js";

export async function cleanUnusedCommand(
  context: CommandContext
) {
  const { config, fileManager, options } = context;

  const { dryRun, yes } = options;

  console.log(chalk.cyan("\nScanning project for translation usage...\n"));

  const patterns = config.usagePatterns;

  if (!patterns || patterns.length === 0) {
    throw new Error(
      "No usagePatterns defined in config."
    );
  }

  // Scan project files
  const files = await glob("src/**/*.{ts,tsx,js,jsx,html}");

  const usedKeys = new Set<string>();

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, "g");

      let match;

      while ((match = regex.exec(content))) {
        const key = match[1];

        if (key) {
          usedKeys.add(key);
        }
      }
    }
  }

  console.log(
    chalk.gray(`Found ${usedKeys.size} used keys in project\n`)
  );

  // Read default locale
  const defaultLocale = config.defaultLocale;
  const nested = await fileManager.readLocale(defaultLocale);
  const flat = flattenObject(nested);

  const localeKeys = Object.keys(flat);

  const unusedKeys = localeKeys.filter(
    key => !usedKeys.has(key)
  );

  if (unusedKeys.length === 0) {
    console.log(
      chalk.green("✔ No unused translation keys found.\n")
    );
    return;
  }

  console.log(
    chalk.yellow(`Unused keys (${unusedKeys.length}):`)
  );

  unusedKeys.slice(0, 20).forEach(key =>
    console.log(`  - ${key}`)
  );

  if (unusedKeys.length > 20) {
    console.log(
      chalk.gray(
        `... and ${unusedKeys.length - 20} more`
      )
    );
  }

  console.log("");

  const confirmed = await confirmAction(
    `This will remove ${unusedKeys.length} keys from ALL locales. Continue?`,
    { skip: yes ?? false }
  );

  if (!confirmed) {
    console.log(chalk.red("\nOperation cancelled.\n"));
    return;
  }

  const locales = config.supportedLocales;

  for (const locale of locales) {
    const nestedLocale = await fileManager.readLocale(locale);
    const flatLocale = flattenObject(nestedLocale);

    for (const key of unusedKeys) {
      delete flatLocale[key];
    }

    const rebuilt =
      config.keyStyle === "nested"
        ? unflattenObject(flatLocale)
        : flatLocale;

    await fileManager.writeLocale(locale, rebuilt, {
      dryRun: dryRun ?? false
    });

    console.log(chalk.green(`✔ Updated ${locale}.json`));
  }

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.\n")
    );
  } else {
    console.log(
      chalk.green(
        `\n✨ Removed ${unusedKeys.length} unused keys from all locales.\n`
      )
    );
  }
}