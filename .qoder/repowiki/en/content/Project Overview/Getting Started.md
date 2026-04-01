# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/commands/init.ts](file://src/commands/init.ts)
- [src/commands/add-lang.ts](file://src/commands/add-lang.ts)
- [src/commands/add-key.ts](file://src/commands/add-key.ts)
- [src/commands/update-key.ts](file://src/commands/update-key.ts)
- [src/commands/clean-unused.ts](file://src/commands/clean-unused.ts)
- [src/commands/validate.ts](file://src/commands/validate.ts)
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/types.ts](file://src/config/types.ts)
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/providers/openai.ts](file://src/providers/openai.ts)
- [src/providers/google.ts](file://src/providers/google.ts)
- [CONTRIBUTING.md](file://CONTRIBUTING.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start Tutorial](#quick-start-tutorial)
4. [Core Concepts](#core-concepts)
5. [Command Reference](#command-reference)
6. [Configuration](#configuration)
7. [Translation Providers](#translation-providers)
8. [Ecosystem Positioning](#ecosystem-positioning)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

## Introduction
i18n-ai-cli is an AI-powered CLI tool designed to streamline internationalization workflows. It automates key management, detects unused keys, validates translation files, and integrates AI providers for automatic translations. Whether you're maintaining a small application or scaling a large product, this tool helps keep your translation files consistent, complete, and up-to-date with minimal manual effort.

## Installation
You can install i18n-ai-cli globally or locally in your project. Local installation is recommended to keep dependencies explicit and reproducible across environments.

- Global installation (not recommended for most projects):
  - npm install -g i18n-ai-cli
- Local installation (recommended):
  - npm install --save-dev i18n-ai-cli
  - Use npx i18n-ai-cli to run commands without global installation
  - Add npm scripts in package.json for convenience

Prerequisites:
- Node.js 18 or higher

Verification:
- Run i18n-ai-cli --help to confirm installation
- On CI systems, use --ci mode to validate behavior without prompts

**Section sources**
- [README.md:17-31](file://README.md#L17-L31)
- [package.json:42-47](file://package.json#L42-L47)
- [CONTRIBUTING.md:44-48](file://CONTRIBUTING.md#L44-L48)

## Quick Start Tutorial
Follow this essential workflow to get started quickly:

1. Initialize configuration
   - Run: i18n-ai-cli init
   - This creates i18n-cli.config.json and initializes your default locale file
   - Use --force to overwrite existing config, --yes to skip prompts, --dry-run to preview

2. Add a language
   - Run: i18n-ai-cli add:lang es --from en
   - Creates es.json and populates it by cloning en.json
   - Use --strict for stricter validation, --yes to skip confirmation

3. Add a translation key
   - Run: i18n-ai-cli add:key welcome.message --value "Welcome to our app"
   - Adds the key to all supported locales with auto-translations
   - Uses OpenAI if OPENAI_API_KEY is set, otherwise falls back to Google Translate

4. Update and sync translations
   - Run: i18n-ai-cli update:key welcome.message --value "Welcome!" --sync
   - Updates the key and syncs translations to all other locales
   - Use --locale to target a specific locale, --provider to specify a translator

5. Clean unused keys
   - Run: i18n-ai-cli clean:unused
   - Scans your project for used keys and removes unused ones from all locales
   - Use --dry-run to preview changes, --ci to enforce non-interactive mode

6. Validate files
   - Run: i18n-ai-cli validate
   - Detects missing/extra keys and type mismatches, auto-corrects when possible
   - Use --provider to translate missing keys during validation

Expected outputs:
- Success messages indicating created/updated files
- Lists of detected issues and fixes
- Summary counts for added, updated, or removed keys

Common pitfalls to avoid:
- Forgetting to configure usagePatterns for clean:unused to work properly
- Not setting OPENAI_API_KEY when preferring OpenAI over Google Translate
- Running --ci without --yes when changes would be applied
- Using invalid language codes (must be ISO 639-1 compatible)

**Section sources**
- [README.md:32-52](file://README.md#L32-L52)
- [README.md:87-228](file://README.md#L87-L228)
- [src/commands/init.ts:25-182](file://src/commands/init.ts#L25-L182)
- [src/commands/add-lang.ts:26-98](file://src/commands/add-lang.ts#L26-L98)
- [src/commands/add-key.ts:8-120](file://src/commands/add-key.ts#L8-L120)
- [src/commands/update-key.ts:17-178](file://src/commands/update-key.ts#L17-L178)
- [src/commands/clean-unused.ts:8-138](file://src/commands/clean-unused.ts#L8-L138)
- [src/commands/validate.ts:121-254](file://src/commands/validate.ts#L121-L254)

## Core Concepts
- Configuration file: i18n-cli.config.json defines localesPath, defaultLocale, supportedLocales, keyStyle, usagePatterns, and autoSort
- Locale files: JSON files per locale stored under localesPath
- Key styles: flat (dot-notation) or nested (hierarchical) structures
- Usage patterns: Regular expressions used by clean:unused to detect used keys in source code
- Dry run mode: Preview changes without writing files (--dry-run)
- CI mode: Non-interactive mode that fails when changes would be made (--ci)

**Section sources**
- [README.md:54-84](file://README.md#L54-L84)
- [src/config/config-loader.ts:24-67](file://src/config/config-loader.ts#L24-L67)
- [src/config/types.ts:3-12](file://src/config/types.ts#L3-L12)

## Command Reference
- init: Create configuration file and initialize default locale
  - Options: -f/--force, -y/--yes, --dry-run
- add:lang: Add a new language locale
  - Options: --from <locale>, --strict, -y, --dry-run
- remove:lang: Remove a language locale
  - Options: -y, --dry-run
- add:key: Add a new translation key to all locales
  - Options: -v/--value <value>, -p/--provider <openai|google>, -y, --dry-run
- update:key: Update a translation key
  - Options: -v/--value <value>, -l/--locale <locale>, -s/--sync, -p/--provider <openai|google>, -y, --dry-run
- remove:key: Remove a translation key from all locales
  - Options: -y, --dry-run
- clean:unused: Remove unused keys from all locales
  - Options: -y, --dry-run, --ci
- validate: Validate and auto-correct translation files
  - Options: -p/--provider <openai|google>, -y, --dry-run, --ci

**Section sources**
- [README.md:87-228](file://README.md#L87-L228)
- [src/bin/cli.ts:34-198](file://src/bin/cli.ts#L34-L198)

## Configuration
Create i18n-cli.config.json using i18n-ai-cli init or manually. Key fields:
- localesPath: Directory containing translation files
- defaultLocale: Default/source language code
- supportedLocales: List of supported language codes
- keyStyle: "flat" or "nested"
- usagePatterns: Regex patterns to detect key usage in source code
- autoSort: Auto-sort keys alphabetically

Validation ensures defaultLocale is included in supportedLocales and there are no duplicates.

**Section sources**
- [README.md:56-84](file://README.md#L56-L84)
- [src/config/config-loader.ts:24-82](file://src/config/config-loader.ts#L24-L82)
- [src/config/types.ts:3-12](file://src/config/types.ts#L3-L12)

## Translation Providers
i18n-ai-cli supports two providers:
- OpenAI: GPT models with context-aware translations; requires OPENAI_API_KEY
- Google Translate: Free translations via @vitalets/google-translate-api

Provider selection order:
1. Explicit --provider flag
2. OPENAI_API_KEY environment variable (OpenAI)
3. Fallback to Google Translate

Setup:
- OpenAI: Set OPENAI_API_KEY environment variable
- Google Translate: No setup required

**Section sources**
- [README.md:268-304](file://README.md#L268-L304)
- [src/bin/cli.ts:82-98](file://src/bin/cli.ts#L82-L98)
- [src/bin/cli.ts:118-136](file://src/bin/cli.ts#L118-L136)
- [src/bin/cli.ts:178-194](file://src/bin/cli.ts#L178-L194)
- [src/providers/openai.ts:14-28](file://src/providers/openai.ts#L14-L28)
- [src/providers/google.ts:13-48](file://src/providers/google.ts#L13-L48)

## Ecosystem Positioning
How i18n-ai-cli compares to manual approaches:
- Automation: Automatically adds, updates, and cleans translation keys
- Consistency: Validates files and auto-corrects missing/extra keys and type mismatches
- AI Integration: Provides natural, context-aware translations via OpenAI or Google Translate
- Developer Experience: Offers dry-run mode, CI-ready flags, and structured configuration

Manual approaches often involve:
- Copy-pasting keys across files
- Forgetting to update all locales
- Missing unused keys accumulating over time
- No automated validation or translation

**Section sources**
- [README.md:9-16](file://README.md#L9-L16)
- [README.md:188-228](file://README.md#L188-L228)

## Troubleshooting
Common issues and resolutions:
- Configuration not found: Ensure i18n-cli.config.json exists in project root or run i18n-ai-cli init
- Invalid language code: Use ISO 639-1 compliant codes (e.g., en, es) or region variants (e.g., en-US)
- Missing usagePatterns: Configure usagePatterns in i18n-cli.config.json for clean:unused to work
- Provider errors: Verify OPENAI_API_KEY is set for OpenAI; Google Translate works without setup
- CI mode failures: Use --yes to confirm changes or --dry-run to preview without applying
- JSON parsing errors: Confirm locale files contain valid JSON

**Section sources**
- [src/config/config-loader.ts:24-42](file://src/config/config-loader.ts#L24-L42)
- [src/commands/add-lang.ts:36-47](file://src/commands/add-lang.ts#L36-L47)
- [src/commands/clean-unused.ts:19-23](file://src/commands/clean-unused.ts#L19-L23)
- [src/providers/openai.ts:17-21](file://src/providers/openai.ts#L17-L21)
- [src/bin/cli.ts:200-209](file://src/bin/cli.ts#L200-L209)

## Next Steps
- Explore advanced usage: Provider-specific flags, CI/CD integration, and programmatic API
- Customize configuration: Adjust keyStyle, usagePatterns, and autoSort for your project
- Integrate into CI: Use --ci and --dry-run for automated quality checks
- Extend functionality: Use the programmatic API for custom integrations

**Section sources**
- [README.md:220-235](file://README.md#L220-L235)
- [README.md:258-267](file://README.md#L258-L267)
- [README.md:306-332](file://README.md#L306-L332)