# i18n-ai-cli

AI-powered CLI tool for managing translation files in internationalized applications. Simplify your i18n workflow with automated key management, unused key detection, AI-powered translations via OpenAI and Google Translate, and flexible configuration.

[![npm version](https://img.shields.io/npm/v/i18n-ai-cli.svg)](https://www.npmjs.com/package/i18n-ai-cli)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

### 🤖 AI-Powered Translation
- **OpenAI GPT Integration**: Context-aware, high-quality translations using GPT-4o, GPT-4-turbo, or GPT-3.5-turbo
- **Google Translate**: Free, fast translations via `@vitalets/google-translate-api`
- **Flexible Provider System**: Easy to extend with custom providers (DeepL coming soon)
- **Context-Aware Translations**: Pass context to improve accuracy for ambiguous terms

### 🌍 Language Management
- Add/remove locales with ISO 639-1 validation
- Clone existing locales when adding new languages
- Support for language variants (e.g., `en-US`, `pt-BR`)

### 🔑 Key Management
- Add, update, or remove translation keys across all locales
- Automatic translation of new keys to all supported languages
- Sync updates across all locales with `--sync` flag
- Support for both flat (`auth.login.title`) and nested key styles

### 🧹 Maintenance & Validation
- **Unused Key Detection**: Scan source code to identify and remove unused keys
- **Structural Validation**: Detect missing, extra, or type-mismatched keys
- **Auto-Correction**: Automatically fix validation issues with optional provider support
- **Conflict Prevention**: Prevents nested vs flat key structure conflicts

### ⚡ Developer Experience
- **Dry Run Mode**: Preview changes before applying them
- **CI/CD Ready**: Non-interactive mode with deterministic exit codes
- **Auto-Sort**: Automatically sort keys alphabetically
- **Interactive Wizard**: Easy configuration setup with `init` command
- **Type Safety**: Written in TypeScript with full type definitions
- **Programmatic API**: Use i18n-ai-cli in your Node.js applications

## 📦 Installation

### Global Installation

```bash
npm install -g i18n-ai-cli
```

### Local Installation (Recommended for Projects)

```bash
npm install --save-dev i18n-ai-cli
```

When installed locally, use one of these methods:

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

### Prerequisites

- **Node.js**: Version 18 or higher
- **Package Manager**: npm or yarn

## 🚀 Quick Start

```bash
# Initialize configuration with interactive wizard
i18n-ai-cli init

# Add a new language (e.g., Spanish from English)
i18n-ai-cli add:lang es --from en

# Add a translation key (auto-translates to all locales)
i18n-ai-cli add:key welcome.message --value "Welcome to our app"

# Update a key and sync translations to all locales
i18n-ai-cli update:key welcome.message --value "Welcome!" --sync

# Clean up unused keys
i18n-ai-cli clean:unused

# Validate translation files and auto-fix issues
i18n-ai-cli validate
```

## ⚙️ Configuration

Create an `i18n-cli.config.json` file in your project root:

```bash
i18n-ai-cli init
```

Or create it manually:

```json
{
  "localesPath": "./locales",
  "defaultLocale": "en",
  "supportedLocales": ["en", "es", "fr", "de"],
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
| `localesPath` | `string` | Yes | - | Directory containing translation files (e.g., `./locales`, `./src/i18n/translations`) |
| `defaultLocale` | `string` | Yes | - | Default/source language code (e.g., `"en"`, `"en-US"`) |
| `supportedLocales` | `string[]` | Yes | - | List of all supported language codes |
| `keyStyle` | `"flat"` \| `"nested"` | No | `"nested"` | Key structure style for JSON files |
| `usagePatterns` | `string[]` | No | `[]` | Regex patterns to detect key usage in source code (must include a capturing group) |
| `autoSort` | `boolean` | No | `true` | Automatically sort keys alphabetically in JSON files |

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
    "useTranslation\\(['\"](?<key>[^'\"]+)['\"]\\)",
    "\\$t\\(['\"](?<key>[^'\"]+)['\"]\\)"
  ]
}
```

**Supported file types:** `.ts`, `.tsx`, `.js`, `.jsx`, `.html`

## 📖 Usage Reference

### Initialize Configuration

```bash
i18n-ai-cli init
```

**Options:**
- `-f, --force`: Overwrite an existing config file
- `-y, --yes`: Skip interactive prompts (use default values)

**What it does:**
- Creates `i18n-cli.config.json` in your project root
- Interactive wizard guides you through setup
- Detects existing translation files automatically

### Language Management Commands

#### Add a New Language

```bash
i18n-ai-cli add:lang <lang-code> [--from <locale>] [--strict]
```

**Examples:**
```bash
# Add French locale
i18n-ai-cli add:lang fr

# Add German locale, cloning from English
i18n-ai-cli add:lang de --from en

# Add Brazilian Portuguese with strict validation
i18n-ai-cli add:lang pt-BR --strict
```

**Options:**
- `--from <locale>`: Clone translations from an existing locale (auto-translates all keys)
- `--strict`: Enable strict mode for additional validations
- `-y, --yes`: Skip confirmation prompts
- `--dry-run`: Preview changes without writing files

**What it does:**
- Validates language code against ISO 639-1 standard
- Creates new locale file (e.g., `fr.json`)
- If `--from` is specified, translates all keys from source locale
- Updates `supportedLocales` in config automatically

**Language Code Format:**
- Simple: `en`, `es`, `fr`, `de`, `ja`, `zh`
- With region: `en-US`, `en-GB`, `pt-BR`, `zh-CN`, `zh-TW`

#### Remove a Language

```bash
i18n-ai-cli remove:lang <lang-code>
```

**Example:**
```bash
i18n-ai-cli remove:lang fr
```

**Options:**
- `-y, --yes`: Skip confirmation prompts
- `--dry-run`: Preview changes without writing files

**What it does:**
- Removes locale file (e.g., `fr.json`)
- Updates `supportedLocales` in config
- Prompts for confirmation before deletion

### Key Management Commands

#### Add a New Translation Key

```bash
i18n-ai-cli add:key <key> --value <value> [--provider <provider>]
```

**Examples:**
```bash
# Add key with auto-translation to all locales
i18n-ai-cli add:key auth.login.title --value "Login"

# Add key with specific provider
i18n-ai-cli add:key welcome.message --value "Welcome to our app" --provider openai
i18n-ai-cli add:key welcome.message --value "Welcome" --provider google
```

**Options:**
- `-v, --value <value>`: **Required**. Value for the default locale
- `-p, --provider <provider>`: Translation provider (`openai` or `google`)
- `-y, --yes`: Skip confirmation prompts
- `--dry-run`: Preview changes without writing files

**What it does:**
- Adds the key to all locale files
- Value is added to default locale as-is
- Automatically translates to all other locales using configured provider
- Creates nested structure based on key name (e.g., `auth.login.title` → `{ auth: { login: { title: ... } } }`)

**Translation Provider Behavior:**
- Uses OpenAI if `OPENAI_API_KEY` environment variable is set
- Falls back to Google Translate otherwise
- Explicitly specify with `--provider openai` or `--provider google`

#### Update a Translation Key

```bash
i18n-ai-cli update:key <key> --value <value> [--locale <locale>] [--sync] [--provider <provider>]
```

**Examples:**
```bash
# Update default locale only
i18n-ai-cli update:key auth.login.title --value "Sign In"

# Update specific locale
i18n-ai-cli update:key auth.login.title --value "Anmelden" --locale de

# Update and sync (translate) to all other locales
i18n-ai-cli update:key welcome.message --value "Welcome" --sync

# Sync with specific provider
i18n-ai-cli update:key welcome.message --value "Welcome" --sync --provider openai
```

**Options:**
- `-v, --value <value>`: **Required**. New value
- `-l, --locale <locale>`: Specific locale to update (default: default locale)
- `-s, --sync`: Sync the updated value to all other locales via translation
- `-p, --provider <provider>`: Translation provider for syncing (`openai` or `google`)
- `-y, --yes`: Skip confirmation prompts
- `--dry-run`: Preview changes without writing files

**What it does:**
- Updates the specified key in the target locale
- With `--sync`, translates the new value to all other locales
- Preserves key structure across all files

**Translation Provider Behavior:**
- Uses OpenAI if `OPENAI_API_KEY` environment variable is set
- Falls back to Google Translate otherwise
- Explicitly specify with `--provider openai` or `--provider google`

#### Remove a Translation Key

```bash
i18n-ai-cli remove:key <key>
```

**Example:**
```bash
i18n-ai-cli remove:key auth.legacy.title
```

**Options:**
- `-y, --yes`: Skip confirmation prompts
- `--dry-run`: Preview changes without writing files

**What it does:**
- Removes the key from all locale files
- Cleans up empty nested objects after removal
- Prompts for confirmation before deletion

### Validation & Maintenance Commands

#### Validate Translation Files

```bash
i18n-ai-cli validate [--provider <provider>]
```

**Examples:**
```bash
# Validate without auto-translation (fills missing keys with empty strings)
i18n-ai-cli validate

# Validate and auto-translate missing keys using OpenAI
export OPENAI_API_KEY=sk-your-api-key-here
i18n-ai-cli validate --provider openai

# Validate and auto-translate using Google Translate
i18n-ai-cli validate --provider google
```

**Options:**
- `-p, --provider <provider>`: Translation provider for auto-translating missing keys (`openai` or `google`)
- `-y, --yes`: Skip confirmation prompts
- `--dry-run`: Preview changes without writing files
- `--ci`: Run in CI mode (non-interactive, fails if issues found)

**What it does:**
- Validates all locale files against the default locale
- Detects and reports:
  - **Missing keys**: Present in default locale but missing in other locales
  - **Extra keys**: Present in other locales but not in default locale
  - **Type mismatches**: Value types differ from default locale (e.g., string vs object)
- Auto-corrects issues:
  - Adds missing keys (with empty strings or translated values if provider specified)
  - Removes extra keys
  - Fixes type mismatches based on default locale's structure

**Note:** Extra keys are always removed during auto-correction. Type mismatches are fixed to match the default locale's value type.

#### Clean Unused Keys

```bash
i18n-ai-cli clean:unused
```

**Options:**
- `-y, --yes`: Skip confirmation prompts
- `--dry-run`: Preview changes without writing files
- `--ci`: Run in CI mode (non-interactive, fails if unused keys found)

**What it does:**
1. Scans source code files in `src/**/*.{ts,tsx,js,jsx,html}`
2. Matches regex patterns defined in `usagePatterns` config
3. Compares found keys against translation files
4. Removes unused keys from all locales
5. Rebuilds JSON structure according to `keyStyle` setting

**How It Works:**
- Uses patterns from config to detect key usage
- Only removes keys that are truly unused
- Preserves keys that match any pattern
- Safe to run multiple times

**Example Output:**
```
Found 120 used keys in source code
Removing 5 unused keys: auth.legacy.*, old.homepage.*
✓ Cleaned 5 unused keys from all locales
```

## 🌐 Global Options

All commands support the following global options:

| Option | Description | When to Use |
|--------|-------------|-------------|
| `-y, --yes` | Skip confirmation prompts | Automate workflows, CI/CD pipelines |
| `--dry-run` | Preview changes without writing files | Review changes before applying them |
| `--ci` | Run in CI mode (non-interactive; fails with exit code if changes would be made) | CI/CD validation checks |
| `-f, --force` | Force operation even if validation fails | Overwrite existing config, bypass validations |

### Global Option Details

#### Dry Run Mode (`--dry-run`)

Preview what changes would be made without actually modifying any files. Useful for reviewing changes before applying them.

```bash
# Preview unused keys cleanup
i18n-ai-cli clean:unused --dry-run

# Preview key removal
i18n-ai-cli remove:key auth.legacy --dry-run

# Preview validation fixes
i18n-ai-cli validate --dry-run
```

#### CI Mode (`--ci`)

Runs in non-interactive mode suitable for CI/CD pipelines. If changes would be made, the command exits with an error code unless `--yes` is also provided.

```bash
# Check for unused keys in CI (fails if any found)
i18n-ai-cli clean:unused --ci --dry-run

# Auto-remove unused keys in CI
i18n-ai-cli clean:unused --ci --yes

# Validate translations in CI (fails if issues found)
i18n-ai-cli validate --ci --dry-run

# Auto-fix validation issues in CI
i18n-ai-cli validate --ci --yes
```

#### Skip Confirmation (`-y, --yes`)

Automatically confirms all prompts without user interaction. Ideal for automated scripts.

```bash
# Remove keys without confirmation
i18n-ai-cli remove:key auth.legacy --yes

# Clean unused keys without confirmation
i18n-ai-cli clean:unused --yes

# Initialize without interactive prompts
i18n-ai-cli init --yes
```

#### Force Mode (`-f, --force`)

Force operations that would otherwise be blocked by validations.

```bash
# Overwrite existing config file
i18n-ai-cli init --force
```

## 💡 Usage Examples

### Basic Workflow

```bash
# 1. Initialize configuration
i18n-ai-cli init

# 2. Add a new locale with translations from English
i18n-ai-cli add:lang de --from en

# 3. Add a new translation key (auto-translates to all locales)
i18n-ai-cli add:key auth.login.title --value "Login"

# 4. Update a key and sync to all locales
i18n-ai-cli update:key auth.login.title --value "Sign In" --sync

# 5. Clean up unused keys
i18n-ai-cli clean:unused --dry-run
i18n-ai-cli clean:unused --yes

# 6. Validate all translations
i18n-ai-cli validate --provider openai
```

### Preview Changes Before Applying

```bash
# See what keys would be removed without actually removing them
i18n-ai-cli remove:key auth.legacy --dry-run

# Preview unused keys cleanup
i18n-ai-cli clean:unused --dry-run

# Check validation issues without auto-fixing
i18n-ai-cli validate --dry-run
```

### Auto-Translation Workflows

```bash
# Add a key and auto-translate to all locales (uses OpenAI if API key is set, else Google)
i18n-ai-cli add:key welcome.message --value "Welcome to our app"

# Force use of specific provider
i18n-ai-cli add:key welcome.message --value "Welcome" --provider openai
i18n-ai-cli add:key welcome.message --value "Welcome" --provider google

# Update and sync (translate) to all locales
i18n-ai-cli update:key welcome.message --value "Welcome" --sync

# Sync with specific provider
i18n-ai-cli update:key welcome.message --value "Willkommen" --locale de --sync --provider openai
```

### Validation with Auto-Correction

```bash
# Validate and auto-translate missing keys using OpenAI
export OPENAI_API_KEY=sk-your-api-key-here
i18n-ai-cli validate --provider openai

# Or use Google Translate (no API key required)
i18n-ai-cli validate --provider google

# Just detect issues without auto-fixing
i18n-ai-cli validate --dry-run
```

### CI/CD Integration

```bash
# Check for unused keys (fails if any found, doesn't modify files)
i18n-ai-cli clean:unused --ci --dry-run

# Apply cleanup in CI pipeline
i18n-ai-cli clean:unused --ci --yes

# Validate translations (fails if issues found)
i18n-ai-cli validate --ci --dry-run

# Auto-correct validation issues in CI
i18n-ai-cli validate --ci --yes
```

### Non-Interactive Automation

```bash
# Initialize with defaults (no prompts)
i18n-ai-cli init --yes

# Remove keys without confirmation
i18n-ai-cli remove:key auth.deprecated --yes

# Force overwrite existing config
i18n-ai-cli init --force
```

### Advanced Scenarios

```bash
# Add multiple languages at once
for lang in es fr de ja; do
  i18n-ai-cli add:lang $lang --from en --yes
done

# Bulk add keys from a JSON file
cat new-keys.json | while read key value; do
  i18n-ai-cli add:key "$key" --value "$value" --yes
done

# Validate before deployment
npm run build && i18n-ai-cli validate --ci
```

## 🤖 Translation Providers

i18n-ai-cli includes a flexible provider system for translation services. The following providers are available:

### Available Providers

| Provider | Description | Cost | Best For |
|----------|-------------|------|----------|
| **OpenAI** | AI-powered translation using GPT models (context-aware, high quality) | Paid (API usage) | Production, nuanced translations, context-aware needs |
| **Google Translate** | Free translation via `@vitalets/google-translate-api` | Free | Quick translations, development, testing |
| **DeepL** | Stub implementation | Coming soon | European languages, high-quality translations |

### Provider Selection Priority

The CLI automatically selects a provider based on this priority:

1. **Explicit `--provider` flag** (highest priority)
   ```bash
   i18n-ai-cli add:key welcome --value "Welcome" --provider openai
   ```

2. **`OPENAI_API_KEY` environment variable set** → uses OpenAI
   ```bash
   export OPENAI_API_KEY=sk-...
   i18n-ai-cli add:key welcome --value "Welcome"  # Uses OpenAI
   ```

3. **Fallback to Google Translate** (lowest priority)
   ```bash
   # No API key set → uses Google
   i18n-ai-cli add:key welcome --value "Welcome"
   ```

---

### OpenAI Provider

The OpenAI provider uses GPT models to deliver context-aware, high-quality translations ideal for production applications.

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
- ✅ Never commit your API key to version control
- ✅ Add `.env` to your `.gitignore` file
- ✅ Use environment variables in CI/CD pipelines
- ✅ Rotate keys periodically for security
- ❌ Don't hardcode API keys in source code

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

The CLI uses translation providers for several commands:

**`add:key` command:**
Automatically translates the value to all non-default locales:
```bash
export OPENAI_API_KEY=sk-your-api-key-here
i18n-ai-cli add:key welcome.message --value "Welcome to our app"
```

**`update:key` command with `--sync`:**
Updates the target locale and translates to all other locales:
```bash
export OPENAI_API_KEY=sk-your-api-key-here
i18n-ai-cli update:key welcome.message --value "Welcome" --sync
```

**`add:lang` command with `--from`:**
Automatically translates all keys when creating a new locale:
```bash
export OPENAI_API_KEY=sk-your-api-key-here
i18n-ai-cli add:lang fr --from en
```

**`validate` command:**
Auto-translates missing keys during validation:
```bash
export OPENAI_API_KEY=sk-your-api-key-here
i18n-ai-cli validate --provider openai
```

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
- `gpt-4o` - Latest flagship model, best quality (recommended for production)
- `gpt-4o-mini` - Faster and more cost-effective
- `gpt-4-turbo` - Previous generation, high quality
- `gpt-3.5-turbo` - Default, fast and cost-effective (good for development)

**Choose a model based on your needs:**
- **Production/Nuanced content**: Use `gpt-4o` for best quality
- **Development/Testing**: Use `gpt-3.5-turbo` for speed and cost savings
- **Bulk translations**: Use `gpt-4o-mini` for balance of quality and cost
- **Complex/niche languages**: Use `gpt-4-turbo` or `gpt-4o`

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
- ✅ Ensure you've set the `OPENAI_API_KEY` environment variable or passed the `apiKey` option
- ✅ Verify the key starts with `sk-` (or `sk-proj-` for project keys)
- ✅ Check that there are no extra spaces or quotes around the key

**Error: "Incorrect API key provided"**
- ✅ Verify your API key is valid at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- ✅ Ensure you have billing set up at [platform.openai.com/settings/organization/billing/overview](https://platform.openai.com/settings/organization/billing/overview)
- ✅ Check if your API key has been revoked or expired

**Error: "Rate limit exceeded"**
- ⏱️ You're making too many requests too quickly
- ⏱️ Implement delays between requests or upgrade your OpenAI plan
- ⏱️ Consider using a less expensive model like `gpt-3.5-turbo` for bulk translations

**Error: "Model not found"**
- ✅ Verify the model name is correct (e.g., `gpt-4o`, not `gpt-4`)
- ✅ Check that your OpenAI account has access to the requested model
- ✅ Some models require specific permissions or higher tier access

**Poor translation quality**
- 🎯 Use a more capable model like `gpt-4o` for better results
- 🎯 Provide context using the `context` parameter for ambiguous terms
- 🎯 Consider post-editing critical translations manually

### Google Translate Provider

The Google Translate provider uses the free `@vitalets/google-translate-api` package for quick translations without requiring API keys.

**Basic usage:**

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

console.log(result.text); // "Hola mundo"
```

**When to use Google Translate:**
- ✅ Quick development and testing
- ✅ Projects with limited budget
- ✅ Simple, straightforward translations
- ✅ Languages well-supported by Google Translate

**Limitations:**
- ⚠️ Less context-aware than OpenAI
- ⚠️ May struggle with nuanced or technical content
- ⚠️ Rate limits may apply for bulk translations

---

## 💻 Programmatic API

You can use i18n-ai-cli programmatically in your Node.js applications:

```typescript
import { loadConfig } from 'i18n-ai-cli/config/config-loader';
import { FileManager } from 'i18n-ai-cli/core/file-manager';
import { TranslationService } from 'i18n-ai-cli/services';
import { OpenAITranslator } from 'i18n-ai-cli/providers';

// Load configuration
const config = await loadConfig();
const fileManager = new FileManager(config);

// Read a locale
const enTranslations = await fileManager.readLocale('en');

// Write a locale
await fileManager.writeLocale('en', { greeting: 'Hello' }, { dryRun: false });

// Use translation service
const translator = new OpenAITranslator({ apiKey: 'sk-your-key' });
const service = new TranslationService(translator);

const translated = await service.translate({
  text: 'Welcome to our app',
  targetLocale: 'es',
  sourceLocale: 'en',
  context: 'greeting message on homepage'
});

console.log(translated.text); // "Bienvenido a nuestra aplicación"
```

**Available APIs:**
- `loadConfig()` - Load i18n-cli configuration
- `FileManager` - Read/write locale files
- `TranslationService` - Translate text using providers
- `OpenAITranslator`, `GoogleTranslator` - Translation providers
- `KeyValidator` - Validate translation keys
- `buildContext()` - Build CLI context for commands

## 🛠️ Development

### Prerequisites

- **Node.js**: Version 18 or higher
- **Package Manager**: npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/wafiamustafa/i18n-cli.git
cd i18n-cli

# Install dependencies
npm install
```

### Build

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Type Checking

```bash
# Run TypeScript type checking
npm run typecheck
```

### Project Structure

```
i18n-cli/
├── src/                    # Source code
│   ├── bin/                # CLI entry point
│   │   └── cli.ts          # Main CLI router
│   ├── commands/           # CLI commands
│   │   ├── add-key.ts      # Add translation keys
│   │   ├── add-lang.ts     # Add new locales
│   │   ├── clean-unused.ts # Remove unused keys
│   │   ├── init.ts         # Initialize config
│   │   ├── remove-key.ts   # Remove keys
│   │   ├── remove-lang.ts  # Remove locales
│   │   ├── update-key.ts   # Update existing keys
│   │   └── validate.ts     # Validate translations
│   ├── config/             # Configuration
│   │   ├── config-loader.ts # Load and parse config
│   │   └── types.ts        # Config type definitions
│   ├── context/            # Context management
│   │   └── build-context.ts # Build CLI context
│   ├── core/               # Core utilities
│   │   ├── confirmation.ts  # User confirmation prompts
│   │   ├── file-manager.ts  # File I/O operations
│   │   ├── key-validator.ts # Key validation logic
│   │   └── object-utils.ts  # Object manipulation helpers
│   ├── providers/          # Translation providers
│   │   ├── deepl.ts        # DeepL provider (stub)
│   │   ├── google.ts       # Google Translate provider
│   │   ├── openai.ts       # OpenAI GPT provider
│   │   └── translator.ts   # Provider interface
│   └── services/           # Business logic
│       └── translation-service.ts # Translation orchestration
│
├── unit-testing/           # Test files (mirrors src/ structure)
│   ├── commands/           # Command tests
│   ├── config/             # Config tests
│   ├── context/            # Context tests
│   ├── core/               # Core utility tests
│   ├── providers/          # Provider tests
│   └── services/           # Service tests
│
├── dist/                   # Compiled output
├── package.json            # Project metadata
├── tsconfig.json           # TypeScript configuration
└── tsup.config.ts          # Build configuration
```

### Local Testing

```bash
# Link the package locally
npm link

# Use in another project or test directory
i18n-ai-cli --help

# Unlink when done
npm unlink -g i18n-ai-cli
```

### Debugging

To debug the CLI:

1. Build in watch mode: `npm run dev`
2. Run with Node.js debugger:
   ```bash
   node --inspect ./dist/cli.js --help
   ```
3. Connect using Chrome DevTools or VS Code debugger

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Development setup
- Code style and standards
- Testing requirements
- Submitting pull requests

### Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## 🤝 Contributing

Pull requests are welcome! We appreciate your contributions to make i18n-ai-cli better.

### Ways to Contribute

- **Report bugs**: Open an issue on [GitHub Issues](https://github.com/wafiamustafa/i18n-cli/issues)
- **Suggest features**: Share your ideas for new features or improvements
- **Improve documentation**: Help us make docs clearer and more comprehensive
- **Write code**: Fix bugs, add features, or improve performance
- **Share feedback**: Join [GitHub Discussions](https://github.com/wafiamustafa/i18n-cli/discussions)

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/i18n-cli.git
   cd i18n-cli
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes** and test thoroughlyly
6. **Submit a pull request** to the main repository

For detailed guidelines, see our [Contributing Guide](CONTRIBUTING.md).

### Need Help?

- 💬 Open an [issue](https://github.com/wafiamustafa/i18n-cli/issues) for bug reports or feature requests
- 💡 Start a [discussion](https://github.com/wafiamustafa/i18n-cli/discussions) for questions or ideas
- 📧 Contact: wafiamustafa@gmail.com

---

## 📄 License

[ISC License](LICENSE) - See [LICENSE](LICENSE) file for details.

This is open source software released under the ISC license, which is similar to MIT/BSD. You can use it freely in personal and commercial projects.

---

## 🙏 Acknowledgments

Thanks to all contributors and the open-source community for making this project possible!

- **OpenAI** for providing powerful GPT models
- **Google Translate** for accessible translation services
- **Vitest** for the excellent testing framework
- **Commander.js** for CLI framework
- All users who provide feedback and suggestions

---

## 📦 Related Projects

- [i18next](https://www.i18next.com/) - The complete internationalization solution for JavaScript
- [react-i18next](https://react.i18next.com/) - React integration for i18next
- [vue-i18n](https://vue-i18n.intlify.dev/) - Internationalization plugin for Vue.js
- [FormatJS](https://formatjs.io/) - Internationalization libraries for React

---

**Made with ❤️ by Wafia Mustafa R. and contributors**

[![npm version](https://img.shields.io/npm/v/i18n-ai-cli.svg)](https://www.npmjs.com/package/i18n-ai-cli)
[![GitHub stars](https://img.shields.io/github/stars/wafiamustafa/i18n-cli.svg)](https://github.com/wafiamustafa/i18n-cli/stargazers)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
