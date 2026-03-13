# Data Validation & Type Safety

<cite>
**Referenced Files in This Document**
- [cli.ts](file://src/bin/cli.ts)
- [build-context.ts](file://src/context/build-context.ts)
- [types.ts](file://src/context/types.ts)
- [config-loader.ts](file://src/config/config-loader.ts)
- [types.ts](file://src/config/types.ts)
- [confirmation.ts](file://src/core/confirmation.ts)
- [object-utils.ts](file://src/core/object-utils.ts)
- [key-validator.ts](file://src/core/key-validator.ts)
- [init.ts](file://src/commands/init.ts)
- [add-key.ts](file://src/commands/add-key.ts)
- [update-key.ts](file://src/commands/update-key.ts)
- [remove-key.ts](file://src/commands/remove-key.ts)
- [clean-unused.ts](file://src/commands/clean-unused.ts)
- [add-lang.ts](file://src/commands/add-lang.ts)
- [remove-lang.ts](file://src/commands/remove-lang.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the data validation and type safety systems that keep translation files structurally sound and prevent destructive operations. It covers:
- Structural conflict prevention during key mutations
- Translation file integrity safeguards
- Confirmation and batch safety mechanisms
- Type safety via TypeScript interfaces and Zod schemas
- How validation integrates with command execution to improve reliability and user experience

## Project Structure
The validation and type safety logic spans configuration loading, context building, core utilities, and command handlers. The CLI orchestrates commands, builds a typed context, and delegates to validators and confirmation prompts before applying changes.

```mermaid
graph TB
CLI["CLI Entrypoint<br/>src/bin/cli.ts"] --> CtxBuild["Build Context<br/>src/context/build-context.ts"]
CtxBuild --> CfgLoad["Load Config (Zod)<br/>src/config/config-loader.ts"]
CtxBuild --> FM["FileManager<br/>(external)"]
CLI --> Cmd["Commands<br/>src/commands/*.ts"]
Cmd --> KV["Key Validator<br/>src/core/key-validator.ts"]
Cmd --> ObjU["Object Utils<br/>src/core/object-utils.ts"]
Cmd --> Conf["Confirmation<br/>src/core/confirmation.ts"]
CfgLoad --> TypesC["Config Types<br/>src/config/types.ts"]
CtxBuild --> TypesX["Context Types<br/>src/context/types.ts"]
```

**Diagram sources**
- [cli.ts:1-122](file://src/bin/cli.ts#L1-L122)
- [build-context.ts:1-16](file://src/context/build-context.ts#L1-L16)
- [config-loader.ts:1-176](file://src/config/config-loader.ts#L1-L176)
- [types.ts:1-12](file://src/config/types.ts#L1-L12)
- [types.ts:1-15](file://src/context/types.ts#L1-L15)
- [key-validator.ts:1-33](file://src/core/key-validator.ts#L1-L33)
- [object-utils.ts:1-95](file://src/core/object-utils.ts#L1-L95)
- [confirmation.ts:1-43](file://src/core/confirmation.ts#L1-L43)

**Section sources**
- [cli.ts:1-122](file://src/bin/cli.ts#L1-L122)
- [build-context.ts:1-16](file://src/context/build-context.ts#L1-L16)

## Core Components
- Configuration validation with Zod ensures schema correctness and logical constraints (e.g., default locale inclusion and unique supported locales). Compiled usage patterns power scanning for unused keys.
- Structural conflict detection prevents adding keys that would overwrite or be overwritten by existing nested structures.
- Safe object flattening/unflattening guards against unsafe key segments and supports robust reconstruction of nested structures.
- Confirmation prompts enforce explicit consent for destructive actions, with CI-aware behavior and dry-run previews.

**Section sources**
- [config-loader.ts:8-67](file://src/config/config-loader.ts#L8-L67)
- [key-validator.ts:1-33](file://src/core/key-validator.ts#L1-L33)
- [object-utils.ts:1-95](file://src/core/object-utils.ts#L1-L95)
- [confirmation.ts:1-43](file://src/core/confirmation.ts#L1-L43)

## Architecture Overview
The system validates early and often: configuration on startup, structural integrity during key operations, and user intent via confirmation prompts. Batch safety is enforced per command with optional dry runs and CI mode constraints.

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "CLI"
participant Ctx as "Context Builder"
participant Cfg as "Config Loader (Zod)"
participant Cmd as "Command Handler"
participant Val as "Validators"
participant FM as "FileManager"
User->>CLI : Run command
CLI->>Ctx : Build context with options
Ctx->>Cfg : Load and validate config
Cfg-->>Ctx : Typed I18nConfig
Ctx-->>CLI : CommandContext
CLI->>Cmd : Invoke handler with context
Cmd->>Val : Structural checks / safety validations
Cmd->>FM : Read/Write locale files
Cmd-->>User : Feedback and results
```

**Diagram sources**
- [cli.ts:30-111](file://src/bin/cli.ts#L30-L111)
- [build-context.ts:5-15](file://src/context/build-context.ts#L5-L15)
- [config-loader.ts:24-67](file://src/config/config-loader.ts#L24-L67)
- [add-key.ts:7-92](file://src/commands/add-key.ts#L7-L92)
- [update-key.ts:15-102](file://src/commands/update-key.ts#L15-L102)
- [remove-key.ts:10-95](file://src/commands/remove-key.ts#L10-L95)
- [clean-unused.ts:8-137](file://src/commands/clean-unused.ts#L8-L137)

## Detailed Component Analysis

### Configuration Validation with Zod
- Schema enforces required fields, types, and defaults.
- Logical validation ensures default locale is supported and supported locales are unique.
- Usage patterns are compiled into RegExp arrays with strict capturing-group requirements.

```mermaid
flowchart TD
Start(["loadConfig"]) --> Read["Read JSON config"]
Read --> Parse["Zod safeParse"]
Parse --> Valid{"Parsed OK?"}
Valid --> |No| ReportErr["Report field-specific errors"]
Valid --> |Yes| Logic["validateConfigLogic"]
Logic --> Compile["compileUsagePatterns"]
Compile --> Return(["Return typed I18nConfig"])
```

**Diagram sources**
- [config-loader.ts:24-67](file://src/config/config-loader.ts#L24-L67)
- [config-loader.ts:69-82](file://src/config/config-loader.ts#L69-L82)
- [config-loader.ts:84-109](file://src/config/config-loader.ts#L84-L109)

**Section sources**
- [config-loader.ts:8-17](file://src/config/config-loader.ts#L8-L17)
- [config-loader.ts:69-82](file://src/config/config-loader.ts#L69-L82)
- [config-loader.ts:84-109](file://src/config/config-loader.ts#L84-L109)
- [types.ts:3-11](file://src/config/types.ts#L3-L11)

### Structural Conflict Prevention
- Validates that adding a key does not violate existing parent or child relationships in flattened structures.
- Prevents overwriting non-object parents or nested children that would be lost.

```mermaid
flowchart TD
S(["validateNoStructuralConflict"]) --> Split["Split key into path segments"]
Split --> ParentLoop["Check each parent path"]
ParentLoop --> ParentConflict{"Parent is non-object?"}
ParentConflict --> |Yes| ThrowP["Throw structural conflict error"]
ParentConflict --> |No| ChildPrefix["Compute 'prefix.' for new key"]
ChildPrefix --> ChildScan["Scan existing flat keys for prefix matches"]
ChildScan --> ChildConflict{"Any nested keys under prefix?"}
ChildConflict --> |Yes| ThrowC["Throw structural conflict error"]
ChildConflict --> |No| Ok(["OK"])
```

**Diagram sources**
- [key-validator.ts:1-33](file://src/core/key-validator.ts#L1-L33)

**Section sources**
- [key-validator.ts:1-33](file://src/core/key-validator.ts#L1-L33)

### Safe Object Flattening and Reconstruction
- Flattens nested objects into dot-notation keys while rejecting dangerous segments (__proto__, constructor, prototype).
- Unflattens safely back to nested structures, preserving object shape.
- Provides helpers to compute flat keys and remove empty objects for cleanup.

```mermaid
flowchart TD
F(["flattenObject"]) --> LoopF["Iterate keys"]
LoopF --> Assert["assertSafeKeySegment"]
Assert --> IsObj{"Is value an object (not array)?"}
IsObj --> |Yes| Recurse["Recurse into nested object"]
IsObj --> |No| Store["Store flat key -> value"]
Store --> DoneF(["Return flat object"])
U(["unflattenObject"]) --> Iterate["Iterate flat keys"]
Iterate --> SplitU["Split by '.'"]
SplitU --> Traverse["Traverse/create intermediate objects"]
Traverse --> SetLeaf["Set leaf value"]
SetLeaf --> DoneU(["Return nested object"])
```

**Diagram sources**
- [object-utils.ts:17-39](file://src/core/object-utils.ts#L17-L39)
- [object-utils.ts:41-64](file://src/core/object-utils.ts#L41-L64)

**Section sources**
- [object-utils.ts:1-95](file://src/core/object-utils.ts#L1-L95)

### Confirmation System for Destructive Operations
- Centralized confirmAction handles interactive prompts, CI constraints, and --yes bypass.
- Commands gate destructive actions behind confirmation unless --yes is provided.

```mermaid
sequenceDiagram
participant Cmd as "Command"
participant Prompt as "confirmAction"
Cmd->>Prompt : Request confirmation with options
alt --yes provided
Prompt-->>Cmd : true
else CI mode without --yes
Prompt-->>Cmd : throw error
else Non-interactive stdout
Prompt-->>Cmd : defaultValue
else Interactive TTY
Prompt-->>Cmd : user choice
end
```

**Diagram sources**
- [confirmation.ts:9-42](file://src/core/confirmation.ts#L9-L42)
- [add-key.ts:55-58](file://src/commands/add-key.ts#L55-L58)
- [update-key.ts:70-73](file://src/commands/update-key.ts#L70-L73)
- [remove-key.ts:55-58](file://src/commands/remove-key.ts#L55-L58)
- [clean-unused.ts:94-97](file://src/commands/clean-unused.ts#L94-L97)

**Section sources**
- [confirmation.ts:1-43](file://src/core/confirmation.ts#L1-L43)
- [add-key.ts:49-53](file://src/commands/add-key.ts#L49-L53)
- [update-key.ts:64-68](file://src/commands/update-key.ts#L64-L68)
- [remove-key.ts:49-53](file://src/commands/remove-key.ts#L49-L53)
- [clean-unused.ts:88-92](file://src/commands/clean-unused.ts#L88-L92)

### Command Execution Flow and Validation Integration
- CLI parses commands and options, then builds a typed CommandContext.
- Commands validate inputs, check structural integrity, and request confirmation before mutating files.
- Dry-run mode allows previewing changes without writing.

```mermaid
sequenceDiagram
participant CLI as "CLI"
participant Ctx as "buildContext"
participant Cmd as "Command"
participant Val as "Validators"
participant FM as "FileManager"
CLI->>Ctx : Build context with global options
Ctx-->>CLI : CommandContext
CLI->>Cmd : Execute with context
Cmd->>Val : validate inputs and structure
Cmd->>FM : Read locale(s)
Cmd->>Val : confirmAction (if destructive)
Cmd->>FM : Write locale(s) (respect dry-run)
Cmd-->>CLI : Success or error
```

**Diagram sources**
- [cli.ts:21-28](file://src/bin/cli.ts#L21-L28)
- [build-context.ts:5-15](file://src/context/build-context.ts#L5-L15)
- [add-key.ts:17-19](file://src/commands/add-key.ts#L17-L19)
- [add-key.ts:32-33](file://src/commands/add-key.ts#L32-L33)
- [add-key.ts:55-63](file://src/commands/add-key.ts#L55-L63)
- [add-key.ts:65-77](file://src/commands/add-key.ts#L65-L77)

**Section sources**
- [cli.ts:30-111](file://src/bin/cli.ts#L30-L111)
- [build-context.ts:1-16](file://src/context/build-context.ts#L1-L16)
- [add-key.ts:1-93](file://src/commands/add-key.ts#L1-L93)

### Validation Scenarios and Error Prevention Strategies
- Adding a key:
  - Ensures both key and value are provided.
  - Validates no structural conflicts in each locale.
  - Checks key uniqueness across locales.
  - Requires confirmation in CI without --yes.
- Updating a key:
  - Validates target locale membership and key existence.
  - Enforces structural integrity for the target key.
  - Requests confirmation before applying changes.
- Removing a key:
  - Verifies key presence in locales to be affected.
  - Requires confirmation across all impacted locales.
- Cleaning unused keys:
  - Scans project with compiled usage patterns.
  - Lists and removes keys not referenced by patterns.
  - Requires confirmation and respects CI constraints.
- Managing locales:
  - Validates locale codes and prevents removing default locale.
  - Prevents duplicate creation and ensures base locale cloning is valid.

**Section sources**
- [add-key.ts:17-19](file://src/commands/add-key.ts#L17-L19)
- [add-key.ts:32-39](file://src/commands/add-key.ts#L32-L39)
- [update-key.ts:25-35](file://src/commands/update-key.ts#L25-L35)
- [update-key.ts:44-51](file://src/commands/update-key.ts#L44-L51)
- [remove-key.ts:17-19](file://src/commands/remove-key.ts#L17-L19)
- [remove-key.ts:33-42](file://src/commands/remove-key.ts#L33-L42)
- [clean-unused.ts:19-23](file://src/commands/clean-unused.ts#L19-L23)
- [clean-unused.ts:59-61](file://src/commands/clean-unused.ts#L59-L61)
- [add-lang.ts:34-47](file://src/commands/add-lang.ts#L34-L47)
- [remove-lang.ts:14-27](file://src/commands/remove-lang.ts#L14-L27)

### User Feedback Mechanisms
- Clear console logs indicate preparation steps, affected files, and outcomes.
- Dry-run mode explicitly warns that no changes were made.
- Errors are surfaced with actionable messages and guidance.

**Section sources**
- [add-key.ts:23-24](file://src/commands/add-key.ts#L23-L24)
- [add-key.ts:79-91](file://src/commands/add-key.ts#L79-L91)
- [update-key.ts:53-62](file://src/commands/update-key.ts#L53-L62)
- [remove-key.ts:82-94](file://src/commands/remove-key.ts#L82-L94)
- [clean-unused.ts:126-136](file://src/commands/clean-unused.ts#L126-L136)

## Dependency Analysis
The validation pipeline depends on typed configuration, safe object utilities, and centralized confirmation logic. Commands depend on validators and confirmation to maintain consistency and safety.

```mermaid
graph LR
Zod["Zod Schema<br/>config-loader.ts"] --> Cfg["Typed Config<br/>types.ts"]
Cfg --> Ctx["CommandContext<br/>build-context.ts"]
Ctx --> Cmds["Commands<br/>*.ts"]
KV["Key Validator<br/>key-validator.ts"] --> Cmds
ObjU["Object Utils<br/>object-utils.ts"] --> Cmds
Conf["Confirmation<br/>confirmation.ts"] --> Cmds
```

**Diagram sources**
- [config-loader.ts:8-17](file://src/config/config-loader.ts#L8-L17)
- [types.ts:3-11](file://src/config/types.ts#L3-L11)
- [build-context.ts:5-15](file://src/context/build-context.ts#L5-L15)
- [key-validator.ts:1-33](file://src/core/key-validator.ts#L1-L33)
- [object-utils.ts:1-95](file://src/core/object-utils.ts#L1-L95)
- [confirmation.ts:1-43](file://src/core/confirmation.ts#L1-L43)

**Section sources**
- [config-loader.ts:1-176](file://src/config/config-loader.ts#L1-L176)
- [build-context.ts:1-16](file://src/context/build-context.ts#L1-L16)
- [types.ts:1-15](file://src/context/types.ts#L1-L15)

## Performance Considerations
- Flattening and unflattening are linear in the number of keys; repeated passes over locales are O(L·K) where L is locales and K is average keys per locale.
- Structural conflict checks scan up to depth d for each key and existing keys; worst-case remains acceptable for typical translation sizes.
- Regex compilation for usage patterns occurs once per config load; scanning scales with file count and total character length scanned.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Configuration errors:
  - Invalid JSON or missing fields produce field-specific Zod errors.
  - Logical mismatches (default locale not in supported locales, duplicates) are reported explicitly.
- Structural conflicts:
  - Adding a key that conflicts with existing parents or children triggers a conflict error with guidance.
- Unsafe keys:
  - Using dangerous key segments is rejected during flattening/unflattening.
- Confirmation failures:
  - CI mode without --yes exits with a clear message; interactive environments require explicit confirmation.
- Dry-run behavior:
  - Dry-run suppresses writes and logs a preview message.

**Section sources**
- [config-loader.ts:46-54](file://src/config/config-loader.ts#L46-L54)
- [config-loader.ts:69-82](file://src/config/config-loader.ts#L69-L82)
- [key-validator.ts:12-18](file://src/core/key-validator.ts#L12-L18)
- [key-validator.ts:26-31](file://src/core/key-validator.ts#L26-L31)
- [object-utils.ts:9-14](file://src/core/object-utils.ts#L9-L14)
- [confirmation.ts:20-25](file://src/core/confirmation.ts#L20-L25)
- [add-key.ts:79-82](file://src/commands/add-key.ts#L79-L82)
- [update-key.ts:91-95](file://src/commands/update-key.ts#L91-L95)

## Conclusion
The system combines strong type safety (TypeScript interfaces and Zod schemas), defensive object manipulation (safe flattening/unflattening), and robust structural validation to prevent translation file corruption. Confirmation prompts and CI-aware behavior ensure operators retain control, while dry-run support enables safe experimentation. Together, these mechanisms elevate reliability and user confidence across all mutation operations.