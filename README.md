# i18n-pro

Professional CLI tool for managing translation files.

## Features

- **Language Management**: Add or remove locales with ease.
- **Key Management**: Add, update, or remove translation keys across all locales.
- **Cleanup**: Identify and remove unused translation keys.
- **Dry Run**: Preview changes before they are applied.
- **CI Friendly**: Support for non-interactive modes and validation.

## Installation

```bash
npm install -g i18n-pro
```

## Usage

### Language Commands

#### Add a new language
```bash
i18n-pro add:lang <lang-code>
```
Example: `i18n-pro add:lang fr`

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

#### Update a translation key
```bash
i18n-pro update:key <key> --value <value> [--locale <locale>]
```
Example: `i18n-pro update:key auth.login.title --value "Sign In" --locale en`

#### Remove a translation key
```bash
i18n-pro remove:key <key>
```
Example: `i18n-pro remove:key auth.login.title`

### Maintenance Commands

#### Clean unused keys
```bash
i18n-pro clean:unused
```

## Global Options

- `-y, --yes`: Skip confirmation prompts.
- `--dry-run`: Preview changes without writing files.
- `--ci`: Run in CI mode (no prompts, exit on issues).
- `-f, --force`: Force operation even if validation fails.

## License

ISC
