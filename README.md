# i18n-pro

Professional CLI tool for managing translation files.

## Features

- **Language Management**: Add or remove locales with ease.
- **Key Management**: Add, update, or remove translation keys across all locales.
- **Cleanup**: Identify and remove unused translation keys by scanning source code.
- **Structural Validation**: Prevents conflicts between nested and flat key structures.
- **Dry Run**: Preview changes before they are applied.
- **CI Friendly**: Non-interactive mode with deterministic exit codes and fail-on-change semantics.
- **Auto Sort**: Automatically sorts keys in translation files.
- **Flexible Key Styles**: Support for both flat (`auth.login.title`) and nested (`auth: { login: { title: ... } }`) key styles.
- **Init Wizard**: Generate a starter config file with sensible defaults.

## Installation

```bash
npm install -g i18n-pro
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

| Option | Type | Description |
|--------|------|-------------|
| `localesPath` | `string` | Directory containing translation files |
| `defaultLocale` | `string` | Default language code |
| `supportedLocales` | `string[]` | List of supported language codes |
| `keyStyle` | `"flat" \| "nested"` | Key structure style |
| `usagePatterns` | `string[]` | Regex patterns to detect key usage in source code (must include a capturing group, preferably named `key`) |
| `autoSort` | `boolean` | Automatically sort keys alphabetically |

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
i18n-pro add:lang <lang-code> [--from <locale>]
```
Example: `i18n-pro add:lang fr`

Options:
- `--from <locale>`: Clone translations from an existing locale

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

## Global Options

All commands support the following global options:

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `--dry-run` | Preview changes without writing files |
| `--ci` | Run in CI mode (no prompts; fails if changes would be made without `--yes`) |
| `-f, --force` | Force operation even if validation fails (used by `init` to overwrite config) |

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

## License

ISC
