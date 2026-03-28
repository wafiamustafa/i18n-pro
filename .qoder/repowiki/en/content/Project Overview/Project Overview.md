# Project Overview

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [CONTRIBUTING.md](file://CONTRIBUTING.md)
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/commands/add-key.ts](file://src/commands/add-key.ts)
- [src/commands/add-lang.ts](file://src/commands/add-lang.ts)
- [src/commands/clean-unused.ts](file://src/commands/clean-unused.ts)
- [src/commands/validate.ts](file://src/commands/validate.ts)
- [src/providers/openai.ts](file://src/providers/openai.ts)
- [src/providers/google.ts](file://src/providers/google.ts)
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/services/translation-service.ts](file://src/services/translation-service.ts)
</cite>

## Update Summary
**Changes Made**
- Updated version references from 1.0.0 to 1.0.9 throughout the documentation
- Updated CLI version display to reflect the new version (note: CLI currently displays 1.0.0, package.json shows 1.0.9)
- Updated package.json and package-lock.json version identifiers
- Enhanced documentation to reflect comprehensive user and contributor guidance
- Added detailed installation instructions, usage examples, and troubleshooting sections
- Expanded AI-powered translation capabilities documentation
- Updated project structure and architecture descriptions

## Table of Contents
1. [Introduction](#introduction)
2. [Installation and Setup](#installation-and-setup)
3. [Quick Start Guide](#quick-start-guide)
4. [Core Features](#core-features)
5. [Configuration](#configuration)
6. [Command Reference](#command-reference)
7. [AI Translation Providers](#ai-translation-providers)
8. [Programmatic API](#programmatic-api)
9. [Development Setup](#development-setup)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Contributing](#contributing)
12. [Conclusion](#conclusion)

## Introduction

i18n-ai-cli is a comprehensive AI-powered CLI tool designed to streamline internationalization (i18n) workflows for applications that manage translation files. Originally evolved from i18n-pro, this tool now provides cutting-edge AI capabilities while maintaining robust automation for managing translation assets across locales.

**Key AI-Powered Value Propositions:**
- **AI-Powered Translation**: Leverage OpenAI GPT models for context-aware, high-quality translations with automatic key cloning and translation workflows
- **Intelligent Key Management**: Enhanced key management with AI-assisted suggestions and validation
- **Smart Cleanup**: Advanced unused key detection with AI-powered context analysis
- **Flexible AI Providers**: Support for multiple translation providers including OpenAI, Google Translate, and DeepL stub implementations

**Traditional Capabilities:**
- Automated key management: Add, update, and remove translation keys consistently across all supported locales
- Unused key detection: Scan source code using configurable usage patterns to identify and remove orphaned translation keys
- Flexible configuration: Define locales path, default locale, supported locales, key styles (flat or nested), usage patterns, and auto-sort behavior
- CI/CD friendly: Non-interactive mode with deterministic exit codes and dry-run previews to prevent unintended changes
- TypeScript foundation: Built with TypeScript for strong typing and developer ergonomics
- Global or local installation: Install globally or locally and use with npx for quick access

**Position in the internationalization ecosystem:**
- Acts as a command-line orchestrator for translation assets with AI assistance, complementing frontend frameworks and backend localization stacks
- Provides structural safeguards (e.g., preventing conflicts between flat and nested key styles) and operational controls (e.g., strict mode, dry runs, CI mode)
- Integrates seamlessly with modern AI translation workflows for enhanced translation quality

**Current Version**: 1.0.9 (maintenance release with bug fixes and minor improvements)

**Important Note**: The package.json indicates version 1.0.9, but the CLI currently displays version 1.0.0. This is a known discrepancy that will be addressed in a future update. All functionality remains identical to version 1.0.8.

## Installation and Setup

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

**Prerequisites:**
- **Node.js**: Version 18 or higher
- **Package Manager**: npm or yarn

## Quick Start Guide

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

## Core Features

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

## Command Reference

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

## AI Translation Providers

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

## Programmatic API

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

## Development Setup

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

## Troubleshooting Guide

### Common Issues and Resolutions

**Configuration not found or invalid:**
- Ensure the configuration file exists in the project root and contains valid JSON.
- Use the initialization wizard to generate a baseline configuration.

**Invalid locale code:**
- Locale codes must conform to ISO 639-1 standards; region variants are accepted.

**Structural conflicts when adding keys:**
- Avoid creating keys that conflict with existing nested or flat structures.

**Usage patterns misconfiguration:**
- Ensure patterns include a capturing group for the key; invalid regex triggers explicit errors.

**CI mode behavior:**
- Without --yes, CI mode throws errors instead of applying changes; use --dry-run to preview.

**AI Translation Issues:**
- **OpenAI API Key Required**: Ensure OPENAI_API_KEY environment variable is set or apiKey option is provided.
- **API Key Validation**: Verify the key starts with 'sk-' and has proper permissions.
- **Rate Limit Exceeded**: Implement backoff strategies or upgrade OpenAI plan.
- **Model Access**: Verify your account has access to the requested GPT model.

### Operational Tips

- Use --dry-run to preview changes before applying.
- Use --ci with --yes to automatically apply changes in pipelines.
- Use --force with init to overwrite existing configuration.
- **AI Integration Tips**: Set OPENAI_API_KEY environment variable for seamless AI operations.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Code style and standards
- Testing requirements
- Submitting pull requests

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
5. **Make your changes** and test thoroughly
6. **Submit a pull request** to the main repository

For detailed guidelines, see our [Contributing Guide](CONTRIBUTING.md).

### Need Help?

- 💬 Open an [issue](https://github.com/wafiamustafa/i18n-cli/issues) for bug reports or feature requests
- 💡 Start a [discussion](https://github.com/wafiamustafa/i18n-cli/discussions) for questions or ideas
- 📧 Contact: wafiamustafa@gmail.com

## Conclusion

i18n-ai-cli represents a significant evolution from its predecessor i18n-pro, transforming into a comprehensive AI-powered CLI tool that delivers robust automation for managing translation assets across locales. The extensive documentation overhaul in README.md reflects this transformation, providing users with detailed installation instructions, comprehensive usage examples, and thorough troubleshooting guidance.

**Key Advantages of the AI Transformation:**
- **Enhanced Translation Quality**: AI-powered context-aware translations improve accuracy and cultural appropriateness
- **Seamless Integration**: AI capabilities integrate naturally with existing workflows without disrupting established processes
- **Future-Ready Architecture**: Extensible provider system prepares for additional AI services and advanced translation features
- **Developer Experience**: Maintains familiar CLI interface while adding powerful AI capabilities
- **Comprehensive Documentation**: Extensive user and contributor guides make the tool accessible to both beginners and advanced users

**Version Information:**
- Current version: 1.0.9 (maintenance release with bug fixes and minor improvements)
- **Important Note**: The package.json indicates version 1.0.9, but the CLI currently displays version 1.0.0. This is a known discrepancy that will be addressed in a future update.
- Maintains backward compatibility with previous versions
- Updated dependency tracking in package-lock.json for consistent package resolution

**Major Enhancements Since Initial Release:**
- Comprehensive user documentation with installation guides
- Detailed command reference with examples
- AI provider integration documentation
- Programmatic API documentation
- Development setup and contribution guidelines
- Extensive troubleshooting sections
- CI/CD integration examples

Whether you are adding languages, managing keys, cleaning unused translations, or leveraging AI-powered translations, i18n-ai-cli provides predictable, safe operations with flexible customization and deterministic behavior in automated environments. The AI integration represents a significant enhancement while preserving the reliability and developer-friendly approach that makes this tool essential for modern internationalization workflows.

**Made with ❤️ by Wafia Mustafa R. and contributors**