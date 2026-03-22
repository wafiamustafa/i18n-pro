import chalk from "chalk";
import { flattenObject, unflattenObject } from "../core/object-utils.js";
import { confirmAction } from "../core/confirmation.js";
import type { CommandContext } from "../context/types.js";
import type {
  Translator,
  ValidateOptions,
  ValidationReport,
} from "../providers/translator.js";

function detectTypeMismatches(
  referenceFlat: Record<string, unknown>,
  localeFlat: Record<string, unknown>
): { key: string; expected: string; actual: string }[] {
  const mismatches: { key: string; expected: string; actual: string }[] = [];

  for (const key of Object.keys(referenceFlat)) {
    if (!(key in localeFlat)) continue;

    const refType = typeof referenceFlat[key];
    const locType = typeof localeFlat[key];

    if (refType !== locType) {
      mismatches.push({ key, expected: refType, actual: locType });
    }
  }

  return mismatches;
}

function printReport(reports: ValidationReport[]): void {
  let totalIssues = 0;

  for (const { locale, issues } of reports) {
    const issueCount =
      issues.missingKeys.length +
      issues.extraKeys.length +
      issues.typeMismatches.length;

    if (issueCount === 0) {
      console.log(chalk.green(`  ✔ ${locale}.json — no issues`));
      continue;
    }

    totalIssues += issueCount;
    console.log(chalk.yellow(`  ✘ ${locale}.json — ${issueCount} issue(s)`));

    if (issues.missingKeys.length > 0) {
      console.log(chalk.red(`    Missing keys (${issues.missingKeys.length}):`));
      for (const key of issues.missingKeys.slice(0, 10)) {
        console.log(`      - ${key}`);
      }
      if (issues.missingKeys.length > 10) {
        console.log(
          chalk.gray(`      ... and ${issues.missingKeys.length - 10} more`)
        );
      }
    }

    if (issues.extraKeys.length > 0) {
      console.log(chalk.red(`    Extra keys (${issues.extraKeys.length}):`));
      for (const key of issues.extraKeys.slice(0, 10)) {
        console.log(`      - ${key}`);
      }
      if (issues.extraKeys.length > 10) {
        console.log(
          chalk.gray(`      ... and ${issues.extraKeys.length - 10} more`)
        );
      }
    }

    if (issues.typeMismatches.length > 0) {
      console.log(
        chalk.red(`    Type mismatches (${issues.typeMismatches.length}):`)
      );
      for (const m of issues.typeMismatches.slice(0, 10)) {
        console.log(
          `      - ${m.key}: expected ${m.expected}, got ${m.actual}`
        );
      }
      if (issues.typeMismatches.length > 10) {
        console.log(
          chalk.gray(
            `      ... and ${issues.typeMismatches.length - 10} more`
          )
        );
      }
    }
  }

  console.log("");

  if (totalIssues === 0) {
    console.log(chalk.green("✔ All translation files are valid.\n"));
  } else {
    console.log(
      chalk.yellow(`Found ${totalIssues} issue(s) across locale files.\n`)
    );
  }
}

async function translateKey(
  translator: Translator,
  sourceText: string,
  targetLocale: string,
  sourceLocale: string
): Promise<string> {
  if (typeof sourceText !== "string" || sourceText === "") {
    return "";
  }

  const result = await translator.translate({
    text: sourceText,
    targetLocale,
    sourceLocale,
  });

  return result.text;
}

export async function validateCommand(
  context: CommandContext,
  validateOptions: ValidateOptions = {}
): Promise<void> {
  const { config, fileManager, options } = context;
  const { dryRun, yes, ci } = options;
  const { translator } = validateOptions;

  console.log(chalk.cyan("\nValidating translation files...\n"));

  const defaultLocale = config.defaultLocale;
  const referenceData = await fileManager.readLocale(defaultLocale);
  const referenceFlat = flattenObject(referenceData);
  const referenceKeys = new Set(Object.keys(referenceFlat));

  const otherLocales = config.supportedLocales.filter(
    (l) => l !== defaultLocale
  );

  // Phase 1: Collect issues
  const reports: ValidationReport[] = [];

  for (const locale of otherLocales) {
    const localeData = await fileManager.readLocale(locale);
    const localeFlat = flattenObject(localeData);
    const localeKeys = new Set(Object.keys(localeFlat));

    const missingKeys = [...referenceKeys].filter((k) => !localeKeys.has(k));
    const extraKeys = [...localeKeys].filter((k) => !referenceKeys.has(k));
    const typeMismatches = detectTypeMismatches(referenceFlat, localeFlat);

    reports.push({
      locale,
      issues: { missingKeys, extraKeys, typeMismatches },
    });
  }

  printReport(reports);

  const fixableReports = reports.filter(
    (r) =>
      r.issues.missingKeys.length > 0 ||
      r.issues.extraKeys.length > 0 ||
      r.issues.typeMismatches.length > 0
  );

  if (fixableReports.length === 0) {
    return;
  }

  // Phase 2: Auto-correct
  if (ci && !yes) {
    throw new Error(
      `CI mode: validation found issues in ${fixableReports.length} locale(s). Re-run with --yes to auto-correct.`
    );
  }

  const confirmMsg = translator
    ? "Auto-correct these issues? (translates missing keys, removes extra keys, re-translates type mismatches)"
    : "Auto-correct these issues? (adds missing keys as empty strings, removes extra keys, fixes type mismatches)";

  const confirmed = await confirmAction(confirmMsg, {
    skip: yes ?? false,
    ci: ci ?? false,
  });

  if (!confirmed) {
    console.log(chalk.red("\nAuto-correction cancelled.\n"));
    return;
  }

  for (const { locale, issues } of fixableReports) {
    const localeData = await fileManager.readLocale(locale);
    const localeFlat = flattenObject(localeData);

    // Collect keys that need translation
    const keysToTranslate = [
      ...issues.missingKeys,
      ...issues.typeMismatches.map((m) => m.key),
    ];

    if (translator && keysToTranslate.length > 0) {
      console.log(
        chalk.gray(
          `  Translating ${keysToTranslate.length} key(s) to ${locale}...`
        )
      );

      for (const key of keysToTranslate) {
        const sourceText = String(referenceFlat[key] ?? "");
        localeFlat[key] = await translateKey(
          translator,
          sourceText,
          locale,
          defaultLocale
        );
      }
    } else {
      // No translator — fall back to empty strings
      for (const key of keysToTranslate) {
        localeFlat[key] = "";
      }
    }

    // Remove extra keys
    for (const key of issues.extraKeys) {
      delete localeFlat[key];
    }

    const rebuilt =
      config.keyStyle === "nested"
        ? unflattenObject(localeFlat)
        : localeFlat;

    await fileManager.writeLocale(locale, rebuilt, {
      dryRun: dryRun ?? false,
    });

    console.log(chalk.green(`✔ Fixed ${locale}.json`));
  }

  if (dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] No files were modified.\n")
    );
  } else {
    console.log(
      chalk.green(
        `\n✨ Auto-corrected ${fixableReports.length} locale file(s).\n`
      )
    );
  }
}
