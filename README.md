# i18n-ai-cli

AI-powered CLI tool for managing translation files in internationalized applications. It detects and fixes missing translations automatically. Simplify your i18n workflow with automated key management, unused key detection, AI-powered translations via OpenAI and Google Translate, and flexible configuration.

[![npm version](https://img.shields.io/npm/v/i18n-ai-cli.svg)](https://www.npmjs.com/package/i18n-ai-cli)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **🤖 AI-Powered Translation**: OpenAI GPT & Google Translate integration
- **🌍 Language Management**: Add/remove locales with ISO 639-1 validation
- **🔑 Key Management**: Add, update, remove keys with auto-translation
- **🧹 Maintenance**: Unused key detection, structural validation, auto-correction
- **⚡ Developer Experience**: Dry run mode, CI/CD ready, TypeScript support

## 📦 Installation

```bash
npm install -g i18n-ai-cli
```

Or locally (recommended):
```bash
npm install --save-dev i18n-ai-cli
```

Then use with `npx i18n-ai-cli` or add to package.json scripts.

**Prerequisites:** Node.js 18+

## 🚀 Quick Start

```bash
# Initialize configuration
i18n-ai-cli init

# Add a language
i18n-ai-cli add:lang es --from en

# Add a translation key
i18n-ai-cli add:key welcome.message --value "Welcome to our app"

# Update and sync translations
i18n-ai-cli update:key welcome.message --value "Welcome!" --sync

# Clean unused keys
i18n-ai-cli clean:unused

# Validate files
i18n-ai-cli validate
```

## ⚙️ Configuration

Create `i18n-cli.config.json`:
```bash
i18n-ai-cli init
```

Example config:
```json
{
  "localesPath": "./locales",
  "defaultLocale": "en",
  "supportedLocales": ["en", "es", "fr", "de"],
  "keyStyle": "nested",
  "usagePatterns": [
    "t\\(['\"](?<key>.*?)['\"]\\)",
    "translate\\(['\"](?<key>.*?)['\"]\\)"
  ],
  "autoSort": true
}
```

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `localesPath` | `string` | Yes | Directory containing translation files |
| `defaultLocale` | `string` | Yes | Default/source language code |
| `supportedLocales` | `string[]` | Yes | List of supported language codes |
| `keyStyle` | `"flat"` \| `"nested"` | No | Key structure style (default: "nested") |
| `usagePatterns` | `string[]` | No | Regex patterns to detect key usage |
| `autoSort` | `boolean` | No | Auto-sort keys alphabetically (default: true) |

## 📖 Usage Reference

### Initialize Configuration

```bash
i18n-ai-cli init
```

**Options:** `-f, --force` (overwrite), `-y, --yes` (skip prompts)

### Language Management Commands

#### Add a New Language

```bash
i18n-ai-cli add:lang <lang-code> [--from <locale>] [--strict]
```

**Examples:**
```bash
i18n-ai-cli add:lang fr
i18n-ai-cli add:lang de --from en
i18n-ai-cli add:lang pt-BR --strict
```

**Options:**
- `--from <locale>`: Clone and auto-translate from existing locale
- `--strict`: Enable strict validation
- `-y, --yes`: Skip confirmation
- `--dry-run`: Preview changes

**What it does:** Validates language code, creates locale file, updates config.

#### Remove a Language

```bash
i18n-ai-cli remove:lang <lang-code>
```

**Example:**
```bash
i18n-ai-cli remove:lang fr
```

**Options:** `-y, --yes`, `--dry-run`

### Key Management Commands

#### Add a New Translation Key

```bash
i18n-ai-cli add:key <key> --value <value> [--provider <provider>]
```

**Examples:**
```bash
i18n-ai-cli add:key auth.login.title --value "Login"
i18n-ai-cli add:key welcome.message --value "Welcome" --provider openai
```

**Options:**
- `-v, --value <value>`: **Required**. Value for default locale
- `-p, --provider <provider>`: Translation provider (`openai` or `google`)
- `-y, --yes`: Skip confirmation
- `--dry-run`: Preview changes

**What it does:** Adds key to all locales with auto-translation.

#### Update a Translation Key

```bash
i18n-ai-cli update:key <key> --value <value> [--locale <locale>] [--sync] [--provider <provider>]
```

**Examples:**
```bash
i18n-ai-cli update:key auth.login.title --value "Sign In"
i18n-ai-cli update:key auth.login.title --value "Anmelden" --locale de
i18n-ai-cli update:key welcome.message --value "Welcome" --sync
```

**Options:**
- `-v, --value <value>`: **Required**. New value
- `-l, --locale <locale>`: Specific locale to update (default: default locale)
- `-s, --sync`: Translate to all other locales
- `-p, --provider <provider>`: Provider for syncing
- `-y, --yes`, `--dry-run`

**What it does:** Updates key and optionally syncs translations.

#### Remove a Translation Key

```bash
i18n-ai-cli remove:key <key>
```

**Example:**
```bash
i18n-ai-cli remove:key auth.legacy.title
```

**Options:** `-y, --yes`, `--dry-run`

### Validation & Maintenance Commands

#### Validate Translation Files

```bash
i18n-ai-cli validate [--provider <provider>]
```

**Examples:**
```bash
i18n-ai-cli validate
export OPENAI_API_KEY=sk-your-api-key-here
i18n-ai-cli validate --provider openai
i18n-ai-cli validate --provider google
```

**Options:**
- `-p, --provider <provider>`: Provider for auto-translating missing keys
- `-y, --yes`, `--dry-run`, `--ci`: CI mode (non-interactive, fails on issues)

**What it does:** Validates files, detects missing/extra/type-mismatched keys, auto-corrects.

#### Clean Unused Keys

```bash
i18n-ai-cli clean:unused
```

**Options:** `-y, --yes`, `--dry-run`, `--ci`

**What it does:** Scans source code using `usagePatterns`, removes unused keys from all locales.

## 🌐 Global Options

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `--dry-run` | Preview changes without writing files |
| `--ci` | CI mode (non-interactive; fails if changes would be made) |
| `-f, --force` | Force operation even if validation fails |

**Examples:**
```bash
i18n-ai-cli clean:unused --dry-run
i18n-ai-cli validate --ci --dry-run
i18n-ai-cli remove:key auth.legacy --yes
```

## 💡 Usage Examples

### Basic Workflow
```bash
i18n-ai-cli init
i18n-ai-cli add:lang de --from en
i18n-ai-cli add:key auth.login.title --value "Login"
i18n-ai-cli update:key auth.login.title --value "Sign In" --sync
i18n-ai-cli clean:unused --dry-run
i18n-ai-cli validate --provider openai
```

### Auto-Translation
```bash
# Uses OpenAI if OPENAI_API_KEY is set, else Google
i18n-ai-cli add:key welcome.message --value "Welcome"

# Specify provider
i18n-ai-cli add:key welcome.message --value "Welcome" --provider openai
i18n-ai-cli update:key welcome.message --value "Willkommen" --locale de --sync --provider openai
```

### CI/CD Integration
```bash
# Check without modifying
i18n-ai-cli clean:unused --ci --dry-run

# Apply in pipeline
i18n-ai-cli clean:unused --ci --yes
i18n-ai-cli validate --ci --yes
```

## 🤖 Translation Providers

### Available Providers

| Provider | Description | Cost |
|----------|-------------|------|
| **OpenAI** | GPT models, context-aware translations | Paid |
| **Google Translate** | Free translation via `@vitalets/google-translate-api` | Free |

### Provider Selection

1. **Explicit `--provider` flag** (highest priority)
2. **`OPENAI_API_KEY` environment variable** → uses OpenAI
3. **Fallback to Google Translate**

### OpenAI Provider Setup

1. Get API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Set environment variable:
   ```bash
   export OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Use in commands:
   ```bash
   i18n-ai-cli add:key welcome --value "Welcome"  # Uses OpenAI automatically
   i18n-ai-cli validate --provider openai
   ```

**Models:** `gpt-4o` (best), `gpt-4o-mini` (fast), `gpt-3.5-turbo` (default)

### Google Translate Provider

No setup required. Used automatically when `OPENAI_API_KEY` is not set.

```bash
i18n-ai-cli add:key welcome --value "Welcome"  # Uses Google if no OpenAI key
```

## 💻 Programmatic API

```typescript
import { loadConfig } from 'i18n-ai-cli/config/config-loader';
import { FileManager } from 'i18n-ai-cli/core/file-manager';
import { TranslationService } from 'i18n-ai-cli/services';
import { OpenAITranslator } from 'i18n-ai-cli/providers';

const config = await loadConfig();
const fileManager = new FileManager(config);

// Read/write locale files
const enTranslations = await fileManager.readLocale('en');
await fileManager.writeLocale('en', { greeting: 'Hello' }, { dryRun: false });

// Translate
const translator = new OpenAITranslator({ apiKey: 'sk-your-key' });
const service = new TranslationService(translator);
const translated = await service.translate({
  text: 'Welcome',
  targetLocale: 'es',
  sourceLocale: 'en',
});
```

**Available APIs:** `loadConfig()`, `FileManager`, `TranslationService`, `OpenAITranslator`, `GoogleTranslator`, `KeyValidator`, `buildContext()`

## 🛠️ Development

### Setup

```bash
git clone https://github.com/wafiamustafa/i18n-cli.git
cd i18n-cli
npm install
```

### Build & Test

```bash
npm run build          # Build
npm run dev            # Watch mode
npm test               # Run tests
npm run typecheck      # Type checking
```

### Local Testing

```bash
npm link
i18n-ai-cli --help
npm unlink -g i18n-ai-cli
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🤝 Contributing

Pull requests welcome! 

- **Report bugs**: [GitHub Issues](https://github.com/wafiamustafa/i18n-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wafiamustafa/i18n-cli/discussions)
- **Contact**: wafiamustafa@gmail.com

## 📄 License

[ISC License](LICENSE) - Open source, free for personal and commercial use.

---

**Made with ❤️ by Wafia Mustafa R. and contributors**

[![npm version](https://img.shields.io/npm/v/i18n-ai-cli.svg)](https://www.npmjs.com/package/i18n-ai-cli)
[![GitHub stars](https://img.shields.io/github/stars/wafiamustafa/i18n-cli.svg)](https://github.com/wafiamustafa/i18n-cli/stargazers)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
