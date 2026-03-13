# i18n-pro

Professional CLI tool for managing translation files in internationalized applications. Simplify your i18n workflow with automated key management, unused key detection, and flexible configuration.

## Features

- **Language Management**: Add or remove locales with ease, with optional cloning from existing locales.
- **Key Management**: Add, update, or remove translation keys across all locales.
- **Cleanup**: Identify and remove unused translation keys by scanning source code.
- **Structural Validation**: Prevents conflicts between nested and flat key structures.
- **Dry Run**: Preview changes before they are applied.
- **CI Friendly**: Non-interactive mode with deterministic exit codes and fail-on-change semantics.
- **Auto Sort**: Automatically sorts keys in translation files.
- **Flexible Key Styles**: Support for both flat (`auth.login.title`) and nested (`auth: { login: { title: ... } }`) key styles.
- **Init Wizard**: Interactive configuration generator with sensible defaults.
- **ISO 639-1 Validation**: Validates language codes against the ISO 639-1 standard.
- **TypeScript**: Written in TypeScript with full type safety.

## Installation

### Global Installation

```bash
npm install -g i18n-pro
```

### Local Installation

```bash
npm install --save-dev i18n-pro
```

Then use with `npx`:

```bash
npx i18n-pro --help
```

## Quick Start

```bash
# Initialize configuration
i18n-pro init

# Add a new language
i18n-pro add:lang es --from en

# Add a translation key
i18n-pro add:key welcome.message --value "Welcome to our app"

# Clean up unused keys
i18n-pro clean:unused
```

## Configuration

Create an `i18n-pro.config.json` file in your project root:

```bash
i18n-pro init
```

Or create it manually:

```json
{
  "localesPath": "./locales",
  "defaultLocale": "en",
  "supportedLocales": ["en", "es", "fr"],
  "keyStyle": "nested",
  "usagePatterns": [
    "t\\(['\"](?<key>.*?)['\"]\\)",
    "translate\\(['\"](?<key>.*?)['\"]\\)",
    "i18n\\.t\\(['\"](?<key>.*?)['\"]\\)"
  ],
  "autoSort": true
}
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `localesPath` | `string` | Yes | - | Directory containing translation files |
| `defaultLocale` | `string` | Yes | - | Default language code (e.g., "en", "en-US") |
| `supportedLocales` | `string[]` | Yes | - | List of supported language codes |
| `keyStyle` | `"flat" \| "nested"` | No | `"nested"` | Key structure style |
| `usagePatterns` | `string[]` | No | `[]` | Regex patterns to detect key usage in source code (must include a capturing group) |
| `autoSort` | `boolean` | No | `true` | Automatically sort keys alphabetically |

### Key Style Examples

**Nested style** (`auth.login.title`):
```json
{
  "auth": {
    "login": {
      "title": "Login"
    }
  }
}
```

**Flat style** (`auth.login.title`):
```json
{
  "auth.login.title": "Login"
}
```

### Usage Patterns

The `usagePatterns` array contains regex patterns used by the `clean:unused` command to detect which translation keys are actively used in your source code. Patterns must include a capturing group for the key.

**Default patterns detect:**
- `t('key')` or `t("key")`
- `translate('key')` or `translate("key")`
- `i18n.t('key')` or `i18n.t("key")`

**Custom pattern with named group:**
```json
{
  "usagePatterns": [
    "useTranslation\\(['\"](?<key>[^'\"]+)['\"]\\)"
  ]
}
```

## Usage

### Initialize configuration
```bash
i18n-pro init
```

Options:
- `-f, --force`: Overwrite an existing config file

### Language Commands

#### Add a new language
```bash
i18n-pro add:lang <lang-code> [--from <locale>] [--strict]
```
Example: `i18n-pro add:lang fr`

Options:
- `--from <locale>`: Clone translations from an existing locale
- `--strict`: Enable strict mode for additional validations

The language code is validated against ISO 639-1 standard (e.g., `en`, `es`, `fr` or `en-US`, `pt-BR`).

#### Remove a language
```bash
i18n-pro remove:lang <lang-code>
```
Example: `i18n-pro remove:lang fr`

### Key Commands

#### Add a new translation key
```bash
i18n-pro add:key <key> --value <value>
```
Example: `i18n-pro add:key auth.login.title --value "Login"`

The key will be added to all locales with an empty string for non-default locales.

#### Update a translation key
```bash
i18n-pro update:key <key> --value <value> [--locale <locale>]
```
Example: `i18n-pro update:key auth.login.title --value "Sign In" --locale en`

If `--locale` is omitted, updates the default locale.

#### Remove a translation key
```bash
i18n-pro remove:key <key>
```
Example: `i18n-pro remove:key auth.login.title`

Removes the key from all locales.

### Maintenance Commands

#### Clean unused keys
```bash
i18n-pro clean:unused
```

Scans your source code (using patterns defined in `usagePatterns`) to identify translation keys that are no longer used and removes them from all locales.

**How it works:**
1. Scans files in `src/**/*.{ts,tsx,js,jsx,html}`
2. Matches patterns against file contents
3. Compares found keys against your translation files
4. Removes unused keys from all locales

**Note:** This command respects your `keyStyle` setting and will rebuild the structure accordingly.

## Global Options

All commands support the following global options:

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `--dry-run` | Preview changes without writing files |
| `--ci` | Run in CI mode (non-interactive; fails with exit code if changes would be made without `--yes`) |
| `-f, --force` | Force operation even if validation fails (used by `init` to overwrite config) |

### Global Option Details

**Dry Run (`--dry-run`)**
Preview what changes would be made without actually modifying any files. Useful for reviewing changes before applying them.

```bash
i18n-pro clean:unused --dry-run
```

**CI Mode (`--ci`)**
Runs in non-interactive mode suitable for CI/CD pipelines. If changes would be made, the command exits with an error code unless `--yes` is also provided.

```bash
# Check for unused keys in CI (fails if any found)
i18n-pro clean:unused --ci --dry-run

# Auto-remove unused keys in CI
i18n-pro clean:unused --ci --yes
```

**Skip Confirmation (`-y, --yes`)**
Automatically confirms all prompts without user interaction.

```bash
i18n-pro remove:key auth.legacy --yes
```

## Examples

### Add a new locale with fallback content
```bash
i18n-pro add:lang de --from en
```

### Preview changes before applying
```bash
i18n-pro remove:key auth.legacy --dry-run
```

### Skip confirmation prompts
```bash
i18n-pro clean:unused --yes
```

### CI/CD integration
```bash
i18n-pro clean:unused --ci --dry-run
```

To apply changes in CI:
```bash
i18n-pro clean:unused --ci --yes
```

### Initialize in non-interactive mode
```bash
i18n-pro init --yes
```

### Force overwrite existing config
```bash
i18n-pro init --force
```

## Translation Providers

i18n-pro includes a flexible provider system for translation services. The following providers are available:

- **Google Translate** (`@vitalets/google-translate-api`)
- **DeepL** (stub implementation)
- **OpenAI** (stub implementation)

Providers can be used programmatically via the `TranslationService` class:

```typescript
import { TranslationService } from 'i18n-pro/services';
import { GoogleTranslator } from 'i18n-pro/providers';

const translator = new GoogleTranslator();
const service = new TranslationService(translator);

const result = await service.translate({
  text: "Hello world",
  targetLocale: "es",
  sourceLocale: "en"
});
```

## Programmatic API

You can also use i18n-pro programmatically in your Node.js applications:

```typescript
import { loadConfig } from 'i18n-pro/config/config-loader';
import { FileManager } from 'i18n-pro/core/file-manager';

const config = await loadConfig();
const fileManager = new FileManager(config);

// Read a locale
const enTranslations = await fileManager.readLocale('en');

// Write a locale
await fileManager.writeLocale('en', { greeting: 'Hello' }, { dryRun: false });
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Build

```bash
npm install
npm run build
```

### Local Testing

```bash
# Link the package locally
npm link

# Use in another project
i18n-pro --help
```

## License

ISC
