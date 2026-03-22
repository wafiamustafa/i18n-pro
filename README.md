# i18n-ai-cli

AI-powered CLI tool for managing translation files in internationalized applications. Simplify your i18n workflow with automated key management, unused key detection, AI-powered translations via OpenAI, and flexible configuration.

## Features

- **AI-Powered Translation**: Translate text using OpenAI GPT models with context-aware accuracy.
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
npm install -g i18n-ai-cli
```

### Local Installation

```bash
npm install --save-dev i18n-ai-cli
```

When installed locally, the `i18n-ai-cli` command is not automatically available in your shell PATH. Use one of these methods:

**Option 1: Use npx (recommended)**
```bash
npx i18n-ai-cli --help
```

**Option 2: Add a script to your package.json**
```json
{
  "scripts": {
    "i18n": "i18n-ai-cli"
  }
}
```
Then run:
```bash
npm run i18n -- --help
```

**Option 3: Install globally**
```bash
npm install -g i18n-ai-cli
i18n-ai-cli --help
```

## Quick Start

```bash
# Initialize configuration
i18n-ai-cli init

# Add a new language
i18n-ai-cli add:lang es --from en

# Add a translation key
i18n-ai-cli add:key welcome.message --value "Welcome to our app"

# Clean up unused keys
i18n-ai-cli clean:unused
```

## Configuration

Create an `i18n-cli.config.json` file in your project root:

```bash
i18n-ai-cli init
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
i18n-ai-cli init
```

Options:
- `-f, --force`: Overwrite an existing config file

### Language Commands

#### Add a new language
```bash
i18n-ai-cli add:lang <lang-code> [--from <locale>] [--strict]
```
Example: `i18n-ai-cli add:lang fr`

Options:
- `--from <locale>`: Clone translations from an existing locale
- `--strict`: Enable strict mode for additional validations

The language code is validated against ISO 639-1 standard (e.g., `en`, `es`, `fr` or `en-US`, `pt-BR`).

#### Remove a language
```bash
i18n-ai-cli remove:lang <lang-code>
```
Example: `i18n-ai-cli remove:lang fr`

### Key Commands

#### Add a new translation key
```bash
i18n-ai-cli add:key <key> --value <value>
```
Example: `i18n-ai-cli add:key auth.login.title --value "Login"`

The key will be added to all locales with an empty string for non-default locales.

#### Update a translation key
```bash
i18n-ai-cli update:key <key> --value <value> [--locale <locale>]
```
Example: `i18n-ai-cli update:key auth.login.title --value "Sign In" --locale en`

If `--locale` is omitted, updates the default locale.

#### Remove a translation key
```bash
i18n-ai-cli remove:key <key>
```
Example: `i18n-ai-cli remove:key auth.login.title`

Removes the key from all locales.

### Maintenance Commands

#### Clean unused keys
```bash
i18n-ai-cli clean:unused
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
i18n-ai-cli clean:unused --dry-run
```

**CI Mode (`--ci`)**
Runs in non-interactive mode suitable for CI/CD pipelines. If changes would be made, the command exits with an error code unless `--yes` is also provided.

```bash
# Check for unused keys in CI (fails if any found)
i18n-ai-cli clean:unused --ci --dry-run

# Auto-remove unused keys in CI
i18n-ai-cli clean:unused --ci --yes
```

**Skip Confirmation (`-y, --yes`)**
Automatically confirms all prompts without user interaction.

```bash
i18n-ai-cli remove:key auth.legacy --yes
```

## Examples

### Add a new locale with fallback content
```bash
i18n-ai-cli add:lang de --from en
```

### Preview changes before applying
```bash
i18n-ai-cli remove:key auth.legacy --dry-run
```

### Skip confirmation prompts
```bash
i18n-ai-cli clean:unused --yes
```

### CI/CD integration
```bash
i18n-ai-cli clean:unused --ci --dry-run
```

To apply changes in CI:
```bash
i18n-ai-cli clean:unused --ci --yes
```

### Initialize in non-interactive mode
```bash
i18n-ai-cli init --yes
```

### Force overwrite existing config
```bash
i18n-ai-cli init --force
```

## Translation Providers

i18n-ai-cli includes a flexible provider system for translation services. The following providers are available:

- **OpenAI** - AI-powered translation using GPT models (context-aware, high quality)
- **Google Translate** - Free translation via `@vitalets/google-translate-api`
- **DeepL** - Stub implementation (coming soon)

### OpenAI Provider

The OpenAI provider uses GPT models to deliver context-aware, high-quality translations.

#### Getting an OpenAI API Key

1. **Sign up for OpenAI**: Go to [platform.openai.com](https://platform.openai.com) and create an account
2. **Navigate to API Keys**: Click on your profile → "View API Keys" or go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. **Create a new key**: Click "Create new secret key", give it a name (e.g., "i18n-cli"), and copy the key
4. **Secure your key**: Store it securely - you won't be able to see it again after closing the dialog

**Note**: OpenAI requires a valid payment method to use the API. New accounts may receive free credits to start.

#### Setup

Provide your OpenAI API key using one of these methods:

**Option 1: Environment variable (recommended for CLI usage)**
```bash
export OPENAI_API_KEY=sk-your-api-key-here
```

Or add it to your `.env` file in your project root:
```
OPENAI_API_KEY=sk-your-api-key-here
```

**Option 2: Constructor option (recommended for programmatic usage)**
```typescript
const translator = new OpenAITranslator({
  apiKey: 'sk-your-api-key-here'
});
```

If both are set, the constructor option takes precedence over the environment variable.

**Security best practices:**
- Never commit your API key to version control
- Add `.env` to your `.gitignore` file
- Use environment variables in CI/CD pipelines
- Rotate keys periodically for security

#### Usage

**Basic translation example:**

```typescript
import { TranslationService } from 'i18n-ai-cli/services';
import { OpenAITranslator } from 'i18n-ai-cli/providers';

// The API key will be read from OPENAI_API_KEY environment variable
const translator = new OpenAITranslator({
  apiKey: 'sk-your-api-key-here',  // or use OPENAI_API_KEY env var
  model: 'gpt-3.5-turbo',          // default model
});
const service = new TranslationService(translator);

const result = await service.translate({
  text: 'Hello world',
  targetLocale: 'es',
  sourceLocale: 'en',
});

console.log(result.text); // "Hola mundo"
```

**Using with CLI commands:**

When using the `add:lang` command with the `--from` option, the CLI can automatically translate all keys from your default locale:

```bash
# Set your API key
export OPENAI_API_KEY=sk-your-api-key-here

# Add a new language with AI-powered translation
i18n-ai-cli add:lang fr --from en
```

This will:
1. Create a new translation file for French (`fr`)
2. Copy all keys from the English (`en`) locale
3. Automatically translate all values using OpenAI
4. Save the translated content to the new locale file

#### Context-Aware Translation

Pass a `context` field to improve translation accuracy for ambiguous terms:

```typescript
const result = await service.translate({
  text: 'Bank',
  targetLocale: 'es',
  context: 'financial institution',
});
// Returns "Banco" (not "Orilla" which means riverbank)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `process.env.OPENAI_API_KEY` | OpenAI API key |
| `model` | `string` | `"gpt-3.5-turbo"` | GPT model to use |
| `baseUrl` | `string` | OpenAI default | Custom API base URL (for Azure OpenAI, local models, etc.) |

**Available models:**
- `gpt-4o` - Latest flagship model, best quality (recommended)
- `gpt-4o-mini` - Faster and more cost-effective
- `gpt-4-turbo` - Previous generation, high quality
- `gpt-3.5-turbo` - Default, fast and cost-effective

Choose a model based on your quality needs and budget. GPT-4 models provide better translation quality for complex or nuanced content.

#### Custom Endpoint

Use the `baseUrl` option to point to Azure OpenAI, a local LLM, or any OpenAI-compatible API:

```typescript
const translator = new OpenAITranslator({
  apiKey: 'your-key',
  baseUrl: 'https://your-resource.openai.azure.com',
  model: 'your-deployment-name',
});
```

#### Troubleshooting

**Error: "OpenAI API key is required"**
- Ensure you've set the `OPENAI_API_KEY` environment variable or passed the `apiKey` option
- Verify the key starts with `sk-` (or `sk-proj-` for project keys)
- Check that there are no extra spaces or quotes around the key

**Error: "Incorrect API key provided"**
- Verify your API key is valid at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Ensure you have billing set up at [platform.openai.com/settings/organization/billing/overview](https://platform.openai.com/settings/organization/billing/overview)
- Check if your API key has been revoked or expired

**Error: "Rate limit exceeded"**
- You're making too many requests too quickly
- Implement delays between requests or upgrade your OpenAI plan
- Consider using a less expensive model like `gpt-3.5-turbo` for bulk translations

**Error: "Model not found"**
- Verify the model name is correct (e.g., `gpt-4o`, not `gpt-4`)
- Check that your OpenAI account has access to the requested model
- Some models require specific permissions or higher tier access

**Poor translation quality**
- Use a more capable model like `gpt-4o` for better results
- Provide context using the `context` parameter for ambiguous terms
- Consider post-editing critical translations manually

### Google Translate Provider

```typescript
import { TranslationService } from 'i18n-ai-cli/services';
import { GoogleTranslator } from 'i18n-ai-cli/providers';

const translator = new GoogleTranslator();
const service = new TranslationService(translator);

const result = await service.translate({
  text: "Hello world",
  targetLocale: "es",
  sourceLocale: "en"
});
```

## Programmatic API

You can also use i18n-ai-cli programmatically in your Node.js applications:

```typescript
import { loadConfig } from 'i18n-ai-cli/config/config-loader';
import { FileManager } from 'i18n-ai-cli/core/file-manager';

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
i18n-ai-cli --help
```

## License

ISC
