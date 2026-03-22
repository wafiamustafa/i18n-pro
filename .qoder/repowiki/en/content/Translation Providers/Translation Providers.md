# Translation Providers

<cite>
**Referenced Files in This Document**
- [translator.ts](file://src/providers/translator.ts)
- [google.ts](file://src/providers/google.ts)
- [deepl.ts](file://src/providers/deepl.ts)
- [openai.ts](file://src/providers/openai.ts)
- [translation-service.ts](file://src/services/translation-service.ts)
- [validate.ts](file://src/commands/validate.ts)
- [validate.test.ts](file://src/commands/validate.test.ts)
- [translator.test.ts](file://src/providers/translator.test.ts)
- [translation-service.test.ts](file://src/services/translation-service.test.ts)
- [README.md](file://README.md)
- [package.json](file://package.json)
- [config-loader.ts](file://src/config/config-loader.ts)
- [types.ts](file://src/config/types.ts)
- [build-context.ts](file://src/context/build-context.ts)
- [types.ts](file://src/context/types.ts)
- [cli.ts](file://src/bin/cli.ts)
</cite>

## Update Summary
**Changes Made**
- Updated to include comprehensive validation functionality that integrates with translation providers
- Added detailed documentation for the validate command and its provider integration capabilities
- Enhanced provider comparison matrix to reflect current validation support
- Updated troubleshooting section with validation-specific error handling
- Added practical examples of validation with automatic translation of missing keys
- Expanded configuration examples for validation workflows

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Validation System Integration](#validation-system-integration)
7. [Dependency Analysis](#dependency-analysis)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)
11. [Appendices](#appendices)

## Introduction
This document explains the translation provider system that enables pluggable integration with external translation services. It covers the provider interface contract, the service layer abstraction, and how different providers are registered and used. Built-in providers include Google Translate integration, DeepL stub, and a fully implemented OpenAI provider with AI-powered translation capabilities. The system now includes comprehensive validation functionality that can automatically translate missing keys using these providers, with intelligent fallback mechanisms and provider selection options. You will learn how to use the TranslationService class to coordinate provider operations, how to configure providers, and how to implement custom providers. Practical examples show programmatic usage, provider selection criteria, error handling patterns, and guidance for choosing providers based on use case and cost considerations.

## Project Structure
The translation provider system is organized around a small set of cohesive modules:
- Provider contracts and implementations under src/providers
- A thin service layer under src/services
- Validation command under src/commands with provider integration
- Configuration loading and runtime context under src/config and src/context
- CLI entry point under src/bin

```mermaid
graph TB
subgraph "CLI"
CLI["cli.ts"]
end
subgraph "Context"
BC["build-context.ts"]
CT["types.ts (context)"]
end
subgraph "Config"
CL["config-loader.ts"]
CTY["types.ts (config)"]
end
subgraph "Services"
TS["translation-service.ts"]
end
subgraph "Commands"
VC["validate.ts"]
end
subgraph "Providers"
TR["translator.ts (contract)"]
G["google.ts"]
D["deepl.ts"]
O["openai.ts"]
end
CLI --> BC
BC --> CL
BC --> CT
BC --> VC
VC --> TS
TS --> TR
G --> TR
D --> TR
O --> TR
```

**Diagram sources**
- [cli.ts:1-162](file://src/bin/cli.ts#L1-L162)
- [build-context.ts:1-16](file://src/context/build-context.ts#L1-L16)
- [config-loader.ts:1-176](file://src/config/config-loader.ts#L1-L176)
- [translation-service.ts:1-18](file://src/services/translation-service.ts#L1-L18)
- [validate.ts:1-254](file://src/commands/validate.ts#L1-L254)
- [translator.ts:1-60](file://src/providers/translator.ts#L1-L60)
- [google.ts:1-50](file://src/providers/google.ts#L1-L50)
- [deepl.ts:1-26](file://src/providers/deepl.ts#L1-L26)
- [openai.ts:1-60](file://src/providers/openai.ts#L1-L60)

**Section sources**
- [cli.ts:1-162](file://src/bin/cli.ts#L1-L162)
- [build-context.ts:1-16](file://src/context/build-context.ts#L1-L16)
- [config-loader.ts:1-176](file://src/config/config-loader.ts#L1-L176)
- [translation-service.ts:1-18](file://src/services/translation-service.ts#L1-L18)
- [validate.ts:1-254](file://src/commands/validate.ts#L1-L254)
- [translator.ts:1-60](file://src/providers/translator.ts#L1-L60)
- [google.ts:1-50](file://src/providers/google.ts#L1-L50)
- [deepl.ts:1-26](file://src/providers/deepl.ts#L1-L26)
- [openai.ts:1-60](file://src/providers/openai.ts#L1-L60)

## Core Components
- Provider contract: Defines TranslationRequest, TranslationResult, and the Translator interface with a name and translate method.
- Built-in providers:
  - GoogleTranslator: Implements translation using @vitalets/google-translate-api with configurable defaults and per-request overrides.
  - DeeplTranslator: Stub implementation indicating DeepL is not implemented yet.
  - OpenAITranslator: **Fully implemented** AI-powered translation using OpenAI GPT models with intelligent prompt engineering, context awareness, and multiple model support.
- TranslationService: Thin wrapper that delegates translate requests to the injected Translator, preserving request fidelity and propagating results and errors.
- Validation System: **New** Comprehensive validation command that detects missing, extra, and type-mismatched keys across locale files, with optional automatic translation of missing keys using providers.

These components form a clean separation of concerns: the contract defines the interface, providers implement it, and the service coordinates usage with validation capabilities.

**Section sources**
- [translator.ts:1-60](file://src/providers/translator.ts#L1-L60)
- [google.ts:1-50](file://src/providers/google.ts#L1-L50)
- [deepl.ts:1-26](file://src/providers/deepl.ts#L1-L26)
- [openai.ts:1-60](file://src/providers/openai.ts#L1-L60)
- [translation-service.ts:1-18](file://src/services/translation-service.ts#L1-L18)
- [validate.ts:1-254](file://src/commands/validate.ts#L1-L254)

## Architecture Overview
The system follows a provider-driven architecture with integrated validation:
- The CLI builds a runtime context that includes configuration and file management capabilities.
- The TranslationService depends on a Translator implementation.
- Providers implement the Translator interface and encapsulate provider-specific logic.
- The validation command integrates with providers to automatically translate missing keys.

```mermaid
classDiagram
class Translator {
+string name
+translate(request) TranslationResult
}
class TranslationService {
-translator : Translator
+translate(request) TranslationResult
}
class ValidateCommand {
-context : CommandContext
-options : ValidateOptions
+execute() Promise<void>
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
class ValidationReport {
-locale : string
-issues : LocaleIssues
}
class LocaleIssues {
-missingKeys : string[]
-extraKeys : string[]
-typeMismatches : TypeMismatch[]
}
Translator <|.. GoogleTranslator
Translator <|.. DeeplTranslator
Translator <|.. OpenAITranslator
TranslationService --> Translator : "delegates translate()"
ValidateCommand --> TranslationService : "uses for translation"
ValidateCommand --> Translator : "optional provider"
ValidateCommand --> ValidationReport : "generates reports"
ValidationReport --> LocaleIssues : "contains"
```

**Diagram sources**
- [translator.ts:14-17](file://src/providers/translator.ts#L14-L17)
- [translation-service.ts:7-16](file://src/services/translation-service.ts#L7-L16)
- [validate.ts:121-254](file://src/commands/validate.ts#L121-L254)
- [google.ts:9-49](file://src/providers/google.ts#L9-L49)
- [deepl.ts:12-25](file://src/providers/deepl.ts#L12-L25)
- [openai.ts:9-59](file://src/providers/openai.ts#L9-L59)
- [translator.ts:46-60](file://src/providers/translator.ts#L46-L60)

## Detailed Component Analysis

### Provider Contract and Data Models
The provider contract defines the shape of translation requests and results, ensuring consistent behavior across providers.

```mermaid
classDiagram
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
class Translator {
+string name
+translate(request) TranslationResult
}
```

- TranslationRequest supports text, target locale, optional source locale, and optional context.
- TranslationResult carries translated text, optional detected source locale, and the provider name.
- Translator requires a name and a translate method returning a TranslationResult.

**Diagram sources**
- [translator.ts:1-12](file://src/providers/translator.ts#L1-L12)
- [translator.ts:14-17](file://src/providers/translator.ts#L14-L17)

**Section sources**
- [translator.ts:1-60](file://src/providers/translator.ts#L1-L60)

### Google Translator Implementation
GoogleTranslator integrates with @vitalets/google-translate-api. It:
- Accepts default options (from, to, host, fetchOptions) in the constructor.
- Applies per-request overrides (sourceLocale) over default options.
- Returns a TranslationResult with detected source locale when available.

```mermaid
sequenceDiagram
participant Caller as "Caller"
participant Service as "TranslationService"
participant Google as "GoogleTranslator"
Caller->>Service : translate(request)
Service->>Google : translate(request)
Google->>Google : merge default options with request overrides
Google-->>Service : Promise<TranslationResult>
Service-->>Caller : TranslationResult
```

**Diagram sources**
- [translation-service.ts:14-16](file://src/services/translation-service.ts#L14-L16)
- [google.ts:17-48](file://src/providers/google.ts#L17-L48)

Key behaviors verified by tests:
- Correct provider name
- Uses request sourceLocale when present, otherwise falls back to default from
- Honors host and fetchOptions when provided
- Propagates API errors
- Handles missing raw metadata gracefully

**Section sources**
- [google.ts:1-50](file://src/providers/google.ts#L1-L50)
- [translator.test.ts:29-184](file://src/providers/translator.test.ts#L29-L184)

### DeepL Translator Stub
DeeplTranslator currently throws a not-implemented error. It accepts apiKey and apiUrl options in the constructor but does not implement translate.

```mermaid
flowchart TD
Start(["translate(request)"]) --> Throw["Throw 'DeepL translator is not implemented...'"]
Throw --> End(["Error"])
```

**Diagram sources**
- [deepl.ts:20-24](file://src/providers/deepl.ts#L20-L24)

**Section sources**
- [deepl.ts:1-26](file://src/providers/deepl.ts#L1-L26)
- [translator.test.ts:186-216](file://src/providers/translator.test.ts#L186-L216)

### OpenAI Translator Implementation
**Updated** OpenAITranslator is now a fully implemented AI-powered translation provider with sophisticated prompt engineering and multiple model support.

The OpenAI provider delivers context-aware, high-quality translations using OpenAI GPT models. It features intelligent prompt engineering with separate system and user messages, supports multiple GPT models, and provides robust error handling.

Key capabilities:
- **Intelligent Prompt Engineering**: Uses a system message for translation instructions and a user message for the actual text
- **Context Awareness**: Incorporates optional context information into the translation prompt
- **Multiple Model Support**: Supports `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, and `gpt-3.5-turbo`
- **Authentication Flexibility**: Accepts API keys via constructor options or environment variables
- **Custom Endpoint Support**: Works with Azure OpenAI and other OpenAI-compatible APIs
- **Robust Error Handling**: Propagates OpenAI API errors with full context

```mermaid
sequenceDiagram
participant Caller as "Caller"
participant Service as "TranslationService"
participant OpenAI as "OpenAITranslator"
participant API as "OpenAI API"
Caller->>Service : translate(request)
Service->>OpenAI : translate(request)
OpenAI->>OpenAI : Build system/user messages
OpenAI->>API : chat.completions.create()
API-->>OpenAI : Response with translated text
OpenAI-->>Service : Promise<TranslationResult>
Service-->>Caller : TranslationResult
```

**Diagram sources**
- [translation-service.ts:14-16](file://src/services/translation-service.ts#L14-L16)
- [openai.ts:30-58](file://src/providers/openai.ts#L30-L58)

**Section sources**
- [openai.ts:1-60](file://src/providers/openai.ts#L1-L60)
- [translator.test.ts:218-410](file://src/providers/translator.test.ts#L218-L410)

### TranslationService Coordination
TranslationService is a minimal façade that:
- Stores a Translator instance
- Delegates translate(request) to the underlying provider
- Preserves all request fields and returns provider results unchanged

```mermaid
sequenceDiagram
participant Client as "Client"
participant Service as "TranslationService"
participant Provider as "Translator"
Client->>Service : translate(request)
Service->>Provider : translate(request)
Provider-->>Service : TranslationResult
Service-->>Client : TranslationResult
```

Behavior verified by tests:
- Constructor acceptance of any Translator
- Passing through all request fields (including context)
- Propagates errors from the provider
- Returning detectedSourceLocale when provided

**Diagram sources**
- [translation-service.ts:7-16](file://src/services/translation-service.ts#L7-L16)

**Section sources**
- [translation-service.ts:1-18](file://src/services/translation-service.ts#L1-L18)
- [translation-service.test.ts:11-184](file://src/services/translation-service.test.ts#L11-L184)

### Programmatic Usage and Provider Selection
Programmatic usage is demonstrated in the repository's README and tests. Typical steps:
- Instantiate a provider (e.g., GoogleTranslator or OpenAITranslator)
- Wrap it with TranslationService
- Call translate with a TranslationRequest

Provider selection criteria:
- **Google Translate**: Good general-purpose coverage, free tier with quotas; suitable for broad language pairs and prototyping.
- **DeepL**: Premium quality; stub indicates future integration; consider when quality is prioritized over cost.
- **OpenAI**: **Fully implemented** AI-powered translation with context awareness and multiple model options; ideal for high-quality, context-sensitive translations.

Switching providers:
- Replace the provider instance passed to TranslationService while keeping the same interface contract.

**Section sources**
- [README.md:277-317](file://README.md#L277-L317)
- [translator.test.ts:29-184](file://src/providers/translator.test.ts#L29-L184)
- [translation-service.test.ts:11-184](file://src/services/translation-service.test.ts#L11-L184)

### Extensibility: Implementing a Custom Provider
To implement a custom provider:
- Implement the Translator interface (name and translate).
- Define provider-specific options in a dedicated options interface.
- Encapsulate provider SDK/client initialization and error mapping.
- Return a TranslationResult with provider name and optional detectedSourceLocale.

Registration and usage:
- Pass your provider instance to TranslationService.
- Use the same TranslationRequest and expect the same TranslationResult contract.

```mermaid
classDiagram
class MyProvider {
+name : string
+translate(request) TranslationResult
}
Translator <|.. MyProvider
```

**Diagram sources**
- [translator.ts:14-17](file://src/providers/translator.ts#L14-L17)
- [translation-service.ts:7-16](file://src/services/translation-service.ts#L7-L16)

**Section sources**
- [translator.ts:1-60](file://src/providers/translator.ts#L1-L60)
- [translation-service.ts:1-18](file://src/services/translation-service.ts#L1-L18)

## Validation System Integration

### Validation Command Architecture
The validation system provides comprehensive translation file validation with optional automatic correction using translation providers. It detects missing, extra, and type-mismatched keys across locale files and can automatically translate missing keys when a provider is available.

```mermaid
flowchart TD
Start(["validateCommand(context, options)"]) --> LoadConfig["Load configuration & context"]
LoadConfig --> ReadDefault["Read default locale file"]
ReadDefault --> FlattenDefault["Flatten default locale structure"]
FlattenDefault --> ReadLocales["Read other locale files"]
ReadLocales --> AnalyzeIssues["Analyze issues per locale"]
AnalyzeIssues --> GenerateReport["Generate validation report"]
GenerateReport --> HasIssues{"Any fixable issues?"}
HasIssues --> |No| Exit["Exit without changes"]
HasIssues --> |Yes| Confirm["Confirm auto-correction"]
Confirm --> |No| Cancel["Cancel auto-correction"]
Confirm --> |Yes| ProcessIssues["Process fixable issues"]
ProcessIssues --> CheckProvider{"Translator provided?"}
CheckProvider --> |Yes| TranslateMissing["Translate missing/type-mismatched keys"]
CheckProvider --> |No| FillEmpty["Fill missing keys with empty strings"]
TranslateMissing --> RemoveExtra["Remove extra keys"]
FillEmpty --> RemoveExtra
RemoveExtra --> WriteFiles["Write corrected files"]
WriteFiles --> Success["Validation complete"]
Cancel --> Exit
```

**Diagram sources**
- [validate.ts:121-254](file://src/commands/validate.ts#L121-L254)

### Validation Report Generation
The validation system generates detailed reports for each locale, categorizing issues into three types:
- **Missing Keys**: Keys present in default locale but absent in target locale
- **Extra Keys**: Keys present in target locale but not in default locale  
- **Type Mismatches**: Keys with different data types between locales

Each report includes counts and lists of issues, with truncation for large issue sets.

**Section sources**
- [validate.ts:11-100](file://src/commands/validate.ts#L11-L100)
- [translator.ts:46-55](file://src/providers/translator.ts#L46-L55)

### Automatic Translation Integration
When a translation provider is available, the validation system can automatically translate missing and type-mismatched keys:

```mermaid
sequenceDiagram
participant Validator as "Validator"
participant Provider as "Translator"
participant FileManager as "FileManager"
Validator->>Validator : Detect missing/type-mismatched keys
Validator->>Provider : translate({text, targetLocale, sourceLocale})
Provider-->>Validator : TranslationResult
Validator->>FileManager : Write corrected locale file
```

**Diagram sources**
- [validate.ts:102-119](file://src/commands/validate.ts#L102-L119)
- [validate.ts:202-223](file://src/commands/validate.ts#L202-L223)

### Provider Selection Logic
The CLI implements intelligent provider selection for validation:
- **Explicit Provider**: User specifies `--provider` flag with "google" or "openai"
- **Environment Detection**: If OPENAI_API_KEY is set, uses OpenAI automatically
- **Fallback**: Defaults to Google Translate when no provider specified

**Section sources**
- [cli.ts:129-150](file://src/bin/cli.ts#L129-L150)
- [validate.ts:178-185](file://src/commands/validate.ts#L178-L185)

### Validation Workflow Examples
**Section sources**
- [validate.test.ts:68-133](file://src/commands/validate.test.ts#L68-L133)
- [validate.test.ts:135-210](file://src/commands/validate.test.ts#L135-L210)
- [validate.test.ts:212-245](file://src/commands/validate.test.ts#L212-L245)

## Dependency Analysis
External dependencies relevant to translation providers:
- @vitalets/google-translate-api: Enables Google Translate integration in GoogleTranslator.
- **openai**: **New dependency** enabling AI-powered translation in OpenAITranslator.
- zod: Used for configuration validation; indirectly affects provider usage by ensuring valid configuration for the broader system.

```mermaid
graph LR
Pkg["package.json"]
GDA["@vitalets/google-translate-api"]
OA["openai"]
Zod["zod"]
Pkg --> GDA
Pkg --> OA
Pkg --> Zod
```

**Diagram sources**
- [package.json:40-51](file://package.json#L40-L51)

**Section sources**
- [package.json:1-60](file://package.json#L1-L60)

## Performance Considerations
- Network latency: Provider calls are asynchronous; batch operations where feasible.
- Request size: Very long texts may be truncated or rate-limited; consider chunking.
- Rate limits: Respect provider quotas; implement retries with backoff for transient failures.
- **OpenAI costs**: Monitor API usage carefully; consider using lower-cost models like `gpt-3.5-turbo` for bulk translations.
- **Model selection**: Choose appropriate models based on quality needs and budget constraints.
- Caching: Cache frequent translations to reduce network calls.
- Error propagation: Let TranslationService propagate provider errors so callers can decide retry or fallback strategies.
- **Validation performance**: Large translation files may take time to process; consider running validation during development rather than CI for large datasets.

## Troubleshooting Guide
Common scenarios and patterns:
- **Not implemented errors**: DeeplTranslator throws explicit errors. Implement or replace with a real provider.
- **API errors**: GoogleTranslator and OpenAITranslator rethrow underlying API errors; wrap calls with try/catch and log context.
- **Missing detected source locale**: When provider response lacks raw metadata, detectedSourceLocale is undefined; handle gracefully.
- **Configuration issues**: Invalid configuration can prevent proper context creation; ensure valid i18n-cli.config.json.
- **Validation failures**: Validation command exits with error when issues are found; use --yes to auto-correct or --dry-run to preview changes.

**OpenAI-specific troubleshooting**:
- **"OpenAI API key is required"**: Ensure OPENAI_API_KEY environment variable is set or apiKey option is provided
- **"Incorrect API key provided"**: Verify API key validity and billing setup
- **"Rate limit exceeded"**: Implement request delays or upgrade plan; consider cheaper models
- **"Model not found"**: Verify model name and account access permissions
- **Poor translation quality**: Use higher-capability models or provide context for ambiguous terms

**Validation-specific troubleshooting**:
- **CI mode failures**: Use --yes flag to auto-correct in CI environments
- **Provider not found**: Ensure correct provider name ("google" or "openai") is specified
- **Large validation runs**: Consider splitting validation across multiple runs for very large translation files
- **Memory issues**: Validation loads all locale files into memory; consider reducing concurrent validations

Operational tips:
- Log TranslationRequest fields (text length, target/source locales) to diagnose provider behavior.
- Use dry-run modes where available to test workflows without network calls.
- Prefer deterministic provider behavior by specifying sourceLocale explicitly.
- **Monitor OpenAI costs** and implement caching for frequently translated content.
- **Validate incrementally**: Run validation on individual locales during development to catch issues early.

**Section sources**
- [translator.test.ts:186-410](file://src/providers/translator.test.ts#L186-L410)
- [translation-service.test.ts:85-96](file://src/services/translation-service.test.ts#L85-L96)
- [validate.test.ts:285-310](file://src/commands/validate.test.ts#L285-L310)

## Conclusion
The translation provider system offers a clean, extensible architecture for integrating external translation services with comprehensive validation capabilities. The Translator interface and TranslationService provide a consistent contract and coordination layer. Built-in providers demonstrate how to implement and configure translators, with the OpenAI provider now offering fully implemented AI-powered translation capabilities. The validation system integrates seamlessly with providers to automatically translate missing keys, providing intelligent fallback mechanisms and flexible provider selection. By following the established patterns, you can implement custom providers, switch between providers programmatically, integrate the system into broader i18n workflows, and leverage validation for maintaining translation file quality.

## Appendices

### Provider Comparison Matrix
**Updated** Current implementation status and capabilities:

| Provider | Status | Quality | Cost | Context Support | Model Options | Validation Support |
|----------|--------|---------|------|-----------------|---------------|-------------------|
| Google Translate | ✅ Fully Implemented | Good | Low | ❌ No | ❌ None | ✅ Automatic Translation |
| DeepL | ⏳ Stub (Coming Soon) | Premium | High | ❌ No | ❌ None | ❌ Not Available |
| OpenAI | ✅ Fully Implemented | Excellent | Medium-High | ✅ Yes | ✅ Multiple | ✅ Automatic Translation |

### Provider-Specific Configuration and Authentication
**Updated** Comprehensive configuration options for all providers:

- **Google Translate**
  - Defaults: from, to, host, fetchOptions
  - Behavior: Per-request sourceLocale overrides default from
  - Notes: No explicit API key required by the wrapper used here; consider fetchOptions for headers if needed
  - **Validation Integration**: Can automatically translate missing keys during validation

- **DeepL**
  - Options: apiKey, apiUrl
  - Status: Stub implementation pending
  - Note: Future integration planned
  - **Validation Integration**: Not available for validation

- **OpenAI** *(Fully Implemented)*
  - **Authentication**: apiKey (constructor option) or OPENAI_API_KEY environment variable
  - **Model Options**: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo (default: gpt-3.5-turbo)
  - **Custom Endpoint**: baseUrl for Azure OpenAI or compatible APIs
  - **Context Support**: Automatic inclusion in translation prompts
  - **Error Handling**: Full propagation of OpenAI API errors
  - **Validation Integration**: Fully supports automatic translation of missing keys

**Section sources**
- [google.ts:8-21](file://src/providers/google.ts#L8-L21)
- [google.ts:17-48](file://src/providers/google.ts#L17-L48)
- [deepl.ts:7-18](file://src/providers/deepl.ts#L7-L18)
- [openai.ts:14-28](file://src/providers/openai.ts#L14-L28)
- [openai.ts:30-58](file://src/providers/openai.ts#L30-L58)

### Example Workflows
**Updated** Practical implementation examples:

- **Programmatic translation with OpenAI**:
  ```typescript
  import { TranslationService } from 'i18n-ai-cli/services';
  import { OpenAITranslator } from 'i18n-ai-cli/providers';

  const translator = new OpenAITranslator({
    apiKey: 'sk-your-api-key-here',
    model: 'gpt-4o', // or 'gpt-3.5-turbo'
  });
  const service = new TranslationService(translator);

  const result = await service.translate({
    text: 'Hello world',
    targetLocale: 'es',
    sourceLocale: 'en',
    context: 'Technical documentation'
  });

  console.log(result.text); // "Hola mundo"
  ```

- **Validation with automatic translation**:
  ```typescript
  import { validateCommand } from 'i18n-ai-cli/commands/validate';
  import { GoogleTranslator } from 'i18n-ai-cli/providers';

  const context = await buildContext({ /* options */ });
  const translator = new GoogleTranslator();
  
  await validateCommand(context, { translator });
  // Automatically translates missing keys using Google Translate
  ```

- **Switching providers**:
  - Keep the same TranslationService instance
  - Replace the underlying provider (e.g., swap GoogleTranslator for OpenAITranslator)
  - Both implement the same Translator interface

- **Error handling patterns**:
  ```typescript
  try {
    const result = await service.translate(request);
    // Handle successful translation
  } catch (error) {
    if (error.message.includes('API key')) {
      // Handle authentication issues
    } else if (error.message.includes('rate limit')) {
      // Handle rate limiting
    } else {
      // Handle other provider-specific errors
    }
  }
  ```

**Section sources**
- [README.md:332-350](file://README.md#L332-L350)
- [translator.test.ts:218-410](file://src/providers/translator.test.ts#L218-L410)
- [translation-service.test.ts:85-96](file://src/services/translation-service.test.ts#L85-L96)
- [validate.test.ts:86-133](file://src/commands/validate.test.ts#L86-L133)

### OpenAI Model Selection Guide
**New** Guidance for choosing the right OpenAI model:

- **gpt-4o** (Recommended): Latest flagship model with best quality and multimodal capabilities
- **gpt-4o-mini**: Fast and cost-effective for simpler translations
- **gpt-4-turbo**: Previous generation, still excellent quality
- **gpt-3.5-turbo** (Default): Fast and cost-effective for general use

**Cost considerations**:
- **gpt-4o**: Higher cost, best quality for complex content
- **gpt-4o-mini**: Lower cost, good balance for bulk translations
- **gpt-3.5-turbo**: Most cost-effective for simple translations

**Quality vs. Cost trade-offs**:
- Use gpt-4o for critical content requiring highest accuracy
- Use gpt-4o-mini for bulk translations where cost is a concern
- Use gpt-3.5-turbo for simple, everyday translations

### Validation Command Usage Examples
**New** Practical examples for validation workflows:

- **Basic validation without provider**:
  ```bash
  i18n-ai-cli validate
  # Detects issues but fills missing keys with empty strings
  ```

- **Validation with automatic translation**:
  ```bash
  export OPENAI_API_KEY=sk-your-api-key-here
  i18n-ai-cli validate --provider openai
  # Automatically translates missing keys using OpenAI
  ```

- **CI/CD integration**:
  ```bash
  # Check for validation issues (fails if any found)
  i18n-ai-cli validate --ci --dry-run
  
  # Auto-correct validation issues in CI
  i18n-ai-cli validate --ci --yes
  ```

- **Programmatic validation**:
  ```typescript
  import { validateCommand } from 'i18n-ai-cli/commands/validate';
  import { GoogleTranslator } from 'i18n-ai-cli/providers';
  
  const context = await buildContext({ ci: true, yes: true });
  const translator = new GoogleTranslator();
  
  await validateCommand(context, { translator });
  // Automatically validates and corrects issues in CI
  ```

**Section sources**
- [README.md:210-231](file://README.md#L210-L231)
- [README.md:299-331](file://README.md#L299-L331)
- [validate.ts:121-254](file://src/commands/validate.ts#L121-L254)
- [cli.ts:117-151](file://src/bin/cli.ts#L117-L151)