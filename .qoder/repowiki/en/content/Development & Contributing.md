# Development & Contributing

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [tsconfig.json](file://tsconfig.json)
- [tsup.config.ts](file://tsup.config.ts)
- [vitest.config.ts](file://vitest.config.ts)
- [README.md](file://README.md)
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/context/types.ts](file://src/context/types.ts)
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/config/types.ts](file://src/config/types.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/core/confirmation.ts](file://src/core/confirmation.ts)
- [src/core/confirmation.test.ts](file://src/core/confirmation.test.ts)
- [src/core/object-utils.ts](file://src/core/object-utils.ts)
- [src/core/object-utils.test.ts](file://src/core/object-utils.test.ts)
- [src/core/key-validator.ts](file://src/core/key-validator.ts)
- [src/core/key-validator.test.ts](file://src/core/key-validator.test.ts)
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/providers/google.ts](file://src/providers/google.ts)
- [src/providers/deepl.ts](file://src/providers/deepl.ts)
- [src/providers/openai.ts](file://src/providers/openai.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/services/translation-service.ts](file://src/services/translation-service.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)
- [src/commands/init.ts](file://src/commands/init.ts)
- [src/commands/init.test.ts](file://src/commands/init.test.ts)
- [src/commands/add-key.ts](file://src/commands/add-key.ts)
- [src/commands/add-lang.ts](file://src/commands/add-lang.ts)
- [src/commands/clean-unused.ts](file://src/commands/clean-unused.ts)
- [src/commands/remove-key.ts](file://src/commands/remove-key.ts)
- [src/commands/remove-lang.ts](file://src/commands/remove-lang.ts)
- [src/commands/update-key.ts](file://src/commands/update-key.ts)
</cite>

## Update Summary
**Changes Made**
- Updated version from 1.0.5 to 1.0.7 in package metadata
- Enhanced build configuration documentation to reflect dependency externalization approach
- Updated development workflow documentation with improved build process details
- Revised TypeScript configuration documentation to align with current setup
- Expanded troubleshooting guide with build-specific guidance

## Table of Contents
1. [Introduction](#introduction)
2. [Version History](#version-history)
3. [Repository Metadata](#repository-metadata)
4. [Contributing Guidelines](#contributing-guidelines)
5. [Project Structure](#project-structure)
6. [Core Components](#core-components)
7. [Architecture Overview](#architecture-overview)
8. [Build System](#build-system)
9. [Testing Framework](#testing-framework)
10. [Detailed Component Analysis](#detailed-component-analysis)
11. [Dependency Analysis](#dependency-analysis)
12. [Performance Considerations](#performance-considerations)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Conclusion](#conclusion)
15. [Appendices](#appendices)

## Introduction
This guide explains how to set up a development environment for i18n-ai-cli, contribute effectively, and maintain high-quality code. It covers prerequisites, build and test processes, project structure, TypeScript configuration, comprehensive unit testing with Vitest, code style, commit conventions, pull request expectations, and practical development tasks such as adding new commands, implementing translation providers, and extending configuration options.

**Updated** The project now includes an enhanced build system with dependency externalization for better CommonJS compatibility and runtime module resolution. Version 1.0.7 introduces improved build performance and compatibility with modern Node.js environments.

## Version History
The project follows semantic versioning with the current version being 1.0.7. This release maintains backward compatibility while enhancing build system performance and dependency management.

**Section sources**
- [package.json](file://package.json)

## Repository Metadata
The project maintains official repository metadata for community collaboration and issue tracking.

**Section sources**
- [package.json](file://package.json)

## Contributing Guidelines
We welcome community contributions to i18n-ai-cli! Feel free to open issues, suggest improvements, or submit pull requests to help enhance this AI-powered internationalization tool.

### Pull Request Workflow
- Fork the repository and create your branch from main
- Ensure your code follows the established patterns and includes comprehensive tests
- Update documentation as needed to reflect your changes
- Submit pull requests with clear descriptions of the problem being solved and the solution implemented

### Issue Reporting
When encountering bugs or requesting features:
- Provide a clear and concise description of the problem
- Include steps to reproduce the issue with expected vs. actual behavior
- Specify your environment details (Node.js version, operating system)
- Include relevant configuration and test scenarios
- Reference related issues or pull requests when applicable

### Code Quality Expectations
- Maintain consistent TypeScript coding standards
- Include unit tests for all new functionality
- Follow the existing architectural patterns
- Keep changes focused and scoped appropriately
- Update documentation and examples when modifying public APIs

**Section sources**
- [README.md](file://README.md)
- [package.json](file://package.json)

## Project Structure
The project is organized around a CLI entrypoint, a command layer, configuration loading, a context builder, core utilities, providers for translation services, and a translation service wrapper. Tests live alongside source files with a naming convention ending in .test.ts.

```mermaid
graph TB
CLI["CLI Entrypoint<br/>src/bin/cli.ts"] --> CtxBuild["Build Context<br/>src/context/build-context.ts"]
CtxBuild --> CfgLoad["Config Loader<br/>src/config/config-loader.ts"]
CtxBuild --> FM["FileManager<br/>src/core/file-manager.ts"]
CLI --> CmdInit["Init Command<br/>src/commands/init.ts"]
CLI --> CmdAddKey["Add Key Command<br/>src/commands/add-key.ts"]
Providers["Translators<br/>src/providers/*.ts"] --> TService["TranslationService<br/>src/services/translation-service.ts"]
Tests["Unit Tests<br/>src/**/*.test.ts"] --> CLI
Tests --> CtxBuild
Tests --> CfgLoad
Tests --> FM
Tests --> CmdInit
Tests --> Providers
Tests --> TService
```

**Diagram sources**
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/commands/init.ts](file://src/commands/init.ts)
- [src/commands/init.test.ts](file://src/commands/init.test.ts)
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/services/translation-service.ts](file://src/services/translation-service.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)

**Section sources**
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/commands/init.ts](file://src/commands/init.ts)
- [src/commands/init.test.ts](file://src/commands/init.test.ts)
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/services/translation-service.ts](file://src/services/translation-service.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)

## Core Components
- CLI Entrypoint: Defines commands, global options, and error handling.
- Context Builder: Loads configuration and constructs the runtime context for commands.
- Config Loader: Reads and validates the configuration file with Zod.
- FileManager: Encapsulates filesystem operations for locale files and sorting.
- Commands: Implement user-facing operations (init, add key, etc.).
- Providers: Pluggable translation adapters (Google, DeepL, OpenAI).
- TranslationService: Thin wrapper delegating translation requests to providers.

**Section sources**
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/services/translation-service.ts](file://src/services/translation-service.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)

## Architecture Overview
The CLI orchestrates commands that rely on a shared context built from configuration and a file manager. Commands delegate to core utilities for validation and transformations. Translation providers are swappable via the Translator interface.

```mermaid
sequenceDiagram
participant User as "Developer"
participant CLI as "CLI Entrypoint"
participant Ctx as "BuildContext"
participant Cfg as "ConfigLoader"
participant FM as "FileManager"
participant Cmd as "Command"
participant Util as "Utilities"
User->>CLI : Invoke command with options
CLI->>Ctx : buildContext(options)
Ctx->>Cfg : loadConfig()
Cfg-->>Ctx : I18nConfig
Ctx->>FM : new FileManager(config)
Ctx-->>CLI : CommandContext
CLI->>Cmd : execute(context, args, options)
Cmd->>Util : validate, transform, confirm
Cmd->>FM : read/write/delete/create locale
Cmd-->>User : Output and logs
```

**Diagram sources**
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/commands/init.ts](file://src/commands/init.ts)
- [src/commands/init.test.ts](file://src/commands/init.test.ts)

## Build System

### Build Configuration Overview
The project uses tsup as its build tool with a dependency externalization strategy for optimal CommonJS compatibility and runtime module resolution. The build configuration is designed to produce ESM bundles while letting Node.js handle dependency resolution at runtime.

**Updated** The build system now employs a strategic externalization approach where all production dependencies are marked as external, allowing Node.js to resolve them dynamically at runtime rather than bundling them statically.

### Tsup Configuration Details
The build system is configured with the following key settings:

- **Entry Point**: Single entry point targeting the CLI binary (`src/bin/cli.ts`)
- **Output Format**: ESM (ECMAScript Modules) for modern compatibility
- **Bundle Strategy**: External dependencies approach for better runtime resolution
- **Source Maps**: Enabled for debugging and development
- **Minification**: Disabled for better debugging and smaller bundle size
- **Shims**: Enabled for compatibility with various module systems

### External Dependencies Strategy
The build system externalizes all production dependencies to address CommonJS compatibility issues:

```mermaid
graph LR
subgraph "Build Output"
Bundle["ESM Bundle<br/>dist/cli.js"]
end
subgraph "Runtime Dependencies"
Google["@vitalets/google-translate-api"]
Chalk["chalk"]
Commander["commander"]
FSExtra["fs-extra"]
Glob["glob"]
Inquirer["inquirer"]
ISO639["iso-639-1"]
Leven["leven"]
OpenAI["openai"]
Zod["zod"]
end
Bundle -.->|"External References"| Google
Bundle -.->|"External References"| Chalk
Bundle -.->|"External References"| Commander
Bundle -.->|"External References"| FSExtra
Bundle -.->|"External References"| Glob
Bundle -.->|"External References"| Inquirer
Bundle -.->|"External References"| ISO639
Bundle -.->|"External References"| Leven
Bundle -.->|"External References"| OpenAI
Bundle -.->|"External References"| Zod
```

**Diagram sources**
- [tsup.config.ts](file://tsup.config.ts)
- [package.json](file://package.json)

### Build Process
The build process follows these steps:

1. **TypeScript Compilation**: Source files are compiled with strict TypeScript settings
2. **Dependency Resolution**: External dependencies are excluded from the bundle
3. **ESM Generation**: Output is generated in ESM format for modern Node.js compatibility
4. **Source Map Creation**: Debugging information is preserved for development
5. **Distribution Packaging**: Final artifacts are placed in the dist directory

### Build Scripts
The project provides several build-related scripts:

- `npm run build`: Creates optimized production builds
- `npm run dev`: Starts development watch mode for continuous compilation
- `npm run typecheck`: Performs TypeScript type checking without emitting files

**Section sources**
- [tsup.config.ts](file://tsup.config.ts)
- [package.json](file://package.json)

## Testing Framework

### Vitest Configuration
The project uses Vitest as its testing framework with comprehensive coverage configuration. The testing setup includes:

- **Global Setup**: Enables global test functions and assertions
- **Environment**: Node.js environment for server-side testing
- **Include Patterns**: Targets all files matching `src/**/*.test.ts`
- **Coverage**: V8 provider with text, json, and html reporters
- **Exclusions**: Test files, type declarations, and CLI entry point

### Testing Coverage
The testing framework achieves comprehensive coverage across all core modules:

- **Commands**: Complete test coverage for all 8 command modules
- **Configuration**: Full validation and loading tests
- **Context**: Context building and dependency injection tests
- **Core Utilities**: Object manipulation, key validation, and confirmation utilities
- **Providers**: Translation provider interfaces and implementations
- **Services**: Translation service delegation and error handling

### Mocking Strategy
Extensive mocking is employed throughout the test suite:

- **File System Operations**: fs-extra mocked for all file operations
- **External APIs**: Google Translate API mocked for provider tests
- **Interactive Prompts**: Inquirer mocked for user interaction simulation
- **Process Environment**: stdout.isTTY and process.cwd mocked for environment detection

### Test Organization
Tests are organized following the same directory structure as source files, with each module having its own test file. The naming convention `.test.ts` clearly identifies test files.

**Section sources**
- [vitest.config.ts](file://vitest.config.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/core/confirmation.test.ts](file://src/core/confirmation.test.ts)
- [src/core/object-utils.test.ts](file://src/core/object-utils.test.ts)
- [src/core/key-validator.test.ts](file://src/core/key-validator.test.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)
- [src/commands/init.test.ts](file://src/commands/init.test.ts)

## Detailed Component Analysis

### CLI Entrypoint
- Registers commands and global options.
- Builds a command context per invocation.
- Centralizes error handling and exit behavior.

**Section sources**
- [src/bin/cli.ts](file://src/bin/cli.ts)

### Context Builder
- Loads configuration and instantiates FileManager.
- Exposes a typed CommandContext to commands.

**Section sources**
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/context/types.ts](file://src/context/types.ts)

### Configuration Loader
- Resolves the config file path and reads JSON.
- Validates with Zod, ensuring logical constraints.
- Compiles usage patterns into RegExp instances.

**Section sources**
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/config/types.ts](file://src/config/types.ts)

### FileManager
- Manages locale files under the configured directory.
- Provides read, write, create, delete, and recursive key sorting.

**Section sources**
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)

### Commands
- Initialization wizard with interactive prompts and non-interactive fallback.
- Key management commands with structural validation and dry-run support.

**Section sources**
- [src/commands/init.ts](file://src/commands/init.ts)
- [src/commands/init.test.ts](file://src/commands/init.test.ts)
- [src/commands/add-key.ts](file://src/commands/add-key.ts)
- [src/commands/add-lang.ts](file://src/commands/add-lang.ts)
- [src/commands/clean-unused.ts](file://src/commands/clean-unused.ts)

### Translation Providers and Service
- Translator interface defines a uniform contract.
- Google provider integrates with a third-party translation library.
- DeepL and OpenAI are stubbed; can be extended by contributors.
- TranslationService delegates translation requests.

```mermaid
classDiagram
class Translator {
<<interface>>
+string name
+translate(request) TranslationResult
}
class TranslationRequest {
+string text
+string targetLocale
+string sourceLocale
+string context
}
class TranslationResult {
+string text
+string detectedSourceLocale
+string provider
}
class TranslationService {
-translator : Translator
+constructor(translator)
+translate(request) TranslationResult
}
class GoogleTranslator {
+name : string
+translate(request) TranslationResult
}
class DeeplTranslator {
+name : string
+translate(request) TranslationResult
}
class OpenAITranslator {
+name : string
+translate(request) TranslationResult
}
Translator <|.. GoogleTranslator
Translator <|.. DeeplTranslator
Translator <|.. OpenAITranslator
TranslationService --> Translator : "delegates"
```

**Diagram sources**
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/providers/google.ts](file://src/providers/google.ts)
- [src/providers/deepl.ts](file://src/providers/deepl.ts)
- [src/providers/openai.ts](file://src/providers/openai.ts)
- [src/services/translation-service.ts](file://src/services/translation-service.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)

### Core Utilities Testing
The testing framework comprehensively covers utility functions:

- **Object Utils**: Flattening, unflattening, key extraction, and empty object removal
- **Key Validator**: Structural conflict detection and validation
- **Confirmation**: Interactive prompt handling and CI mode support

**Section sources**
- [src/core/object-utils.ts](file://src/core/object-utils.ts)
- [src/core/object-utils.test.ts](file://src/core/object-utils.test.ts)
- [src/core/key-validator.ts](file://src/core/key-validator.ts)
- [src/core/key-validator.test.ts](file://src/core/key-validator.test.ts)
- [src/core/confirmation.ts](file://src/core/confirmation.ts)
- [src/core/confirmation.test.ts](file://src/core/confirmation.test.ts)

## Dependency Analysis
- Runtime dependencies include CLI parsing, filesystem helpers, inquirer, color output, and translation APIs.
- Dev dependencies include TypeScript, bundling/transpilation, and testing.

```mermaid
graph LR
pkg["package.json"] --> deps["Runtime Dependencies"]
pkg --> devDeps["Dev Dependencies"]
cfg["tsconfig.json"] --> tsc["TypeScript Compiler Options"]
vitest["vitest.config.ts"] --> coverage["Coverage Settings"]
tsup["tsup.config.ts"] --> external["External Dependencies"]
```

**Diagram sources**
- [package.json](file://package.json)
- [tsconfig.json](file://tsconfig.json)
- [vitest.config.ts](file://vitest.config.ts)
- [tsup.config.ts](file://tsup.config.ts)

**Section sources**
- [package.json](file://package.json)
- [tsconfig.json](file://tsconfig.json)
- [vitest.config.ts](file://vitest.config.ts)
- [tsup.config.ts](file://tsup.config.ts)

## Performance Considerations
- Prefer batch operations where feasible (e.g., updating multiple locales).
- Use dry-run mode to preview work before committing changes.
- Keep usage patterns precise to avoid expensive scans during cleanup operations.
- The external dependency approach reduces bundle size and improves startup performance.
- ESM format provides better tree-shaking and import performance.

## Troubleshooting Guide
- Configuration file not found or invalid JSON: ensure the configuration file exists and is valid JSON; review validation messages for missing or incorrect fields.
- Regex usage patterns invalid or missing capturing groups: fix patterns to include a capturing group; the loader validates patterns and throws descriptive errors.
- Locale file missing or invalid JSON: FileManager throws explicit errors when reading non-existent or malformed locale files.
- Provider not implemented: DeepL and OpenAI translators are stubs; implement or provide an adapter conforming to the Translator interface.
- Test failures due to mocking: ensure proper mock setup and restoration in beforeEach/afterEach hooks.
- Coverage not meeting requirements: add tests for new functionality and verify coverage reports.
- **Build failures due to external dependencies**: Ensure all external dependencies are properly declared in package.json and available at runtime.
- **CommonJS compatibility issues**: The external dependency approach resolves CommonJS dynamic require issues by letting Node.js handle resolution.
- **Import errors in development**: Verify that all dependencies are installed and accessible in the node_modules directory.

**Updated** Added troubleshooting guidance for build-specific issues related to the external dependency configuration.

**Section sources**
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/providers/deepl.ts](file://src/providers/deepl.ts)
- [src/providers/deepl.test.ts](file://src/providers/deepl.test.ts)
- [src/providers/openai.ts](file://src/providers/openai.ts)
- [src/providers/openai.test.ts](file://src/providers/openai.test.ts)
- [tsup.config.ts](file://tsup.config.ts)

## Conclusion
By following this guide, you can confidently develop, test, and extend i18n-ai-cli. The comprehensive unit testing framework with 16 test files ensures robust coverage across all core functionality. The enhanced build system with dependency externalization provides better CommonJS compatibility and runtime module resolution. Use the provided scripts, adhere to the TypeScript configuration, write tests with Vitest following the established patterns, and implement new features by extending the context, commands, providers, or configuration schema.

Version 1.0.7 enhances the development experience with improved build performance, better dependency management, and enhanced compatibility with modern Node.js environments.

## Appendices

### Prerequisites
- Node.js version requirement and package manager: see the development section in the README for Node.js version and installation steps.

**Section sources**
- [README.md](file://README.md)

### Build and Test Scripts
- Install dependencies, build, watch, test, and typecheck are defined in the package scripts.

**Section sources**
- [package.json](file://package.json)

### TypeScript Configuration
- Strict compiler options, module resolution, target, declaration generation, and source maps are configured centrally.

**Section sources**
- [tsconfig.json](file://tsconfig.json)

### Build System Configuration
- **External Dependencies**: All production dependencies are externalized for better CommonJS compatibility
- **ESM Output**: Generated in ESM format for modern Node.js compatibility
- **Source Maps**: Enabled for debugging and development
- **Minification**: Disabled for better debugging experience

**Section sources**
- [tsup.config.ts](file://tsup.config.ts)
- [package.json](file://package.json)

### Testing with Vitest
- Global setup, Node environment, include patterns, and coverage configuration are centralized.

**Section sources**
- [vitest.config.ts](file://vitest.config.ts)

### Adding a New Command
- Steps:
  - Define the command in the CLI entrypoint with arguments and options.
  - Implement the command handler in a new file under commands/.
  - Use the context to access config and FileManager.
  - Respect global options (dry-run, yes, ci, force).
  - Add unit tests following the existing .test.ts naming pattern.

**Section sources**
- [src/bin/cli.ts](file://src/bin/cli.ts)
- [src/context/build-context.ts](file://src/context/build-context.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/core/file-manager.ts](file://src/core/file-manager.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)

### Implementing a Translation Provider
- Steps:
  - Implement the Translator interface in a new provider file.
  - Integrate with the external service in the translate method.
  - Wrap usage with TranslationService for consistent behavior.
  - Add tests verifying the provider's translate method.

**Section sources**
- [src/providers/translator.ts](file://src/providers/translator.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/services/translation-service.ts](file://src/services/translation-service.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)
- [src/providers/google.ts](file://src/providers/google.ts)
- [src/providers/deepl.ts](file://src/providers/deepl.ts)
- [src/providers/openai.ts](file://src/providers/openai.ts)

### Extending Configuration Options
- Steps:
  - Add the new option to the configuration types.
  - Extend the Zod schema with appropriate validation.
  - Apply defaults and derive computed fields (e.g., compiled usage patterns).
  - Update consumers to handle the new field.

**Section sources**
- [src/config/types.ts](file://src/config/types.ts)
- [src/config/config-loader.ts](file://src/config/config-loader.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)

### Writing Effective Tests
- Use Vitest with Node environment and global assertions enabled.
- Place tests adjacent to source files with .test.ts suffix.
- Leverage mocks for filesystem and external services.
- Ensure coverage targets include source files and exclude test and declaration files.
- Follow the established testing patterns from the existing test suite.

**Section sources**
- [vitest.config.ts](file://vitest.config.ts)
- [src/context/build-context.test.ts](file://src/context/build-context.test.ts)
- [src/config/config-loader.test.ts](file://src/config/config-loader.test.ts)
- [src/core/file-manager.test.ts](file://src/core/file-manager.test.ts)
- [src/core/confirmation.test.ts](file://src/core/confirmation.test.ts)
- [src/core/object-utils.test.ts](file://src/core/object-utils.test.ts)
- [src/core/key-validator.test.ts](file://src/core/key-validator.test.ts)
- [src/providers/translator.test.ts](file://src/providers/translator.test.ts)
- [src/services/translation-service.test.ts](file://src/services/translation-service.test.ts)
- [src/commands/init.test.ts](file://src/commands/init.test.ts)

### Code Style Standards
- Enforced by TypeScript strictness and compiler options.
- Maintain ES modules, explicit types, and consistent formatting.

**Section sources**
- [tsconfig.json](file://tsconfig.json)

### Commit Conventions and Pull Requests
- Use conventional commit messages (e.g., feat:, fix:, chore:, docs:).
- Reference related issues in commit messages.
- Keep PRs focused and include tests and documentation updates.

### Issue Reporting
- Provide a clear description, reproduction steps, expected vs. actual behavior, and environment details (Node.js version, OS).
- Include test coverage information and any failing test scenarios.

### Community Contribution Process
- Fork the repository and create feature branches
- Follow established code patterns and testing requirements
- Submit pull requests with comprehensive descriptions
- Engage constructively in code review discussions
- Update documentation to reflect changes
- Test thoroughly across supported environments

**Section sources**
- [README.md](file://README.md)
- [package.json](file://package.json)