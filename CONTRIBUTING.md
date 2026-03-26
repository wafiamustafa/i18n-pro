# Contributing to i18n-ai-cli

Thank you for your interest in contributing to i18n-ai-cli! We welcome contributions from the community and are excited to see what you'll build.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to provide a welcoming and inclusive experience for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/i18n-cli.git
   cd i18n-cli
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/wafiamustafa/i18n-cli.git
   ```

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Link for Local Testing

To test your changes locally:

```bash
npm link
```

Then you can use `i18n-ai-cli` command globally to test your changes.

To unlink when you're done:

```bash
npm unlink -g i18n-ai-cli
```

## Making Changes

### Branch Naming

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-new-command` - for new features
- `fix/bug-description` - for bug fixes
- `docs/update-readme` - for documentation updates
- `refactor/some-component` - for code refactoring

### Code Style

- The project uses TypeScript with strict type checking
- Follow the existing code patterns and conventions
- Ensure your code passes type checking: `npm run typecheck`

### Project Structure

```
src/
├── bin/           # CLI entry point
├── commands/      # CLI commands (add-key, remove-lang, etc.)
├── config/        # Configuration loading and types
├── context/       # Context management and dependency injection
├── core/          # Core utilities (file-manager, validators, etc.)
├── providers/     # Translation providers (OpenAI, Google, etc.)
└── services/      # Translation services
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test -- --watch
```

### Writing Tests

- Tests are co-located with source files (e.g., `add-key.ts` and `add-key.test.ts`)
- We use [Vitest](https://vitest.dev/) for testing
- Aim for high test coverage, especially for new features
- Mock external dependencies (file system, API calls, etc.)

### Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { someFunction } from './some-module';

describe('someFunction', () => {
  it('should do something', async () => {
    const result = await someFunction();
    expect(result).toBe(expectedValue);
  });
});
```

## Submitting Changes

### Before Submitting

1. **Build the project** to ensure it compiles:
   ```bash
   npm run build
   ```

2. **Run type checking**:
   ```bash
   npm run typecheck
   ```

3. **Run all tests** and ensure they pass:
   ```bash
   npm test
   ```

4. **Test your changes manually** if applicable:
   ```bash
   npm link
   i18n-ai-cli --help
   ```

### Commit Messages

Write clear and descriptive commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Reference issues and PRs where appropriate

Examples:
```
Add support for DeepL translation provider

Fix validation error when key contains special characters

Update README with new CLI options
```

### Pull Request Process

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub from your fork to the main repository

3. **Fill out the PR template** with:
   - Clear description of what changed and why
   - Any related issue numbers
   - Screenshots or examples if applicable

4. **Wait for review** - maintainers will review your PR and may request changes

5. **Address feedback** by making additional commits to your branch

### PR Checklist

- [ ] Code builds successfully (`npm run build`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear and descriptive

## Release Process

The release process is handled by maintainers:

1. Update version in `package.json`
2. Run `npm version patch|minor|major`
3. Push tags: `git push --follow-tags`
4. Publish to npm: `npm publish`

## Questions?

- Open an [issue](https://github.com/wafiamustafa/i18n-cli/issues) for bug reports or feature requests
- Start a [discussion](https://github.com/wafiamustafa/i18n-cli/discussions) for questions or ideas

Thank you for contributing!
