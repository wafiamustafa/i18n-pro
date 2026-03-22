import { describe, it, expect, beforeEach, vi } from "vitest";
import { validateCommand } from "./validate.js";
import { confirmAction } from "../core/confirmation.js";
import type { CommandContext } from "../context/types.js";
import type { I18nConfig } from "../config/types.js";
import type { Translator } from "../providers/translator.js";

vi.mock("../core/confirmation.js", () => ({
  confirmAction: vi.fn(),
}));

describe("validate command", () => {
  const mockConfig: I18nConfig = {
    localesPath: "./locales",
    defaultLocale: "en",
    supportedLocales: ["en", "de", "fr"],
    keyStyle: "nested",
    usagePatterns: [],
    compiledUsagePatterns: [],
    autoSort: true,
  };

  const createMockContext = (
    options: Partial<CommandContext["options"]> = {}
  ): CommandContext => ({
    config: { ...mockConfig },
    fileManager: {
      readLocale: vi.fn(),
      writeLocale: vi.fn(),
    } as any,
    options: {
      yes: false,
      dryRun: false,
      ci: false,
      ...options,
    },
  });

  const createMockTranslator = (): Translator => ({
    name: "mock",
    translate: vi.fn(async (request) => ({
      text: `[${request.targetLocale}] ${request.text}`,
      provider: "mock",
    })),
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(confirmAction).mockResolvedValue(true);
  });

  it("should report no issues when all locales match default", async () => {
    const context = createMockContext();
    vi.mocked(context.fileManager.readLocale).mockImplementation(
      async (locale: string) => {
        if (locale === "en") return { greeting: "Hello", farewell: "Bye" };
        if (locale === "de") return { greeting: "Hallo", farewell: "Tschüss" };
        if (locale === "fr") return { greeting: "Bonjour", farewell: "Au revoir" };
        return {};
      }
    );

    await validateCommand(context);

    expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
  });

  it("should detect missing keys and auto-correct by adding empty strings when no translator", async () => {
    const context = createMockContext();
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello", farewell: "Bye" }) // en (analysis)
      .mockResolvedValueOnce({ greeting: "Hallo" }) // de (analysis - missing farewell)
      .mockResolvedValueOnce({ greeting: "Bonjour", farewell: "Au revoir" }) // fr (analysis)
      .mockResolvedValueOnce({ greeting: "Hallo" }); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(1);
    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[0]).toBe("de");
    expect(call[1]).toHaveProperty("greeting", "Hallo");
    expect(call[1]).toHaveProperty("farewell", "");
  });

  it("should translate missing keys when translator is provided", async () => {
    const context = createMockContext();
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    const translator = createMockTranslator();

    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello", farewell: "Bye" }) // en (analysis)
      .mockResolvedValueOnce({ greeting: "Hallo" }) // de (analysis - missing farewell)
      .mockResolvedValueOnce({ greeting: "Hallo" }); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context, { translator });

    expect(translator.translate).toHaveBeenCalledWith({
      text: "Bye",
      targetLocale: "de",
      sourceLocale: "en",
    });

    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[0]).toBe("de");
    expect(call[1]).toHaveProperty("greeting", "Hallo");
    expect(call[1]).toHaveProperty("farewell", "[de] Bye");
  });

  it("should translate type-mismatched keys when translator is provided", async () => {
    const context = createMockContext();
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    const translator = createMockTranslator();

    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ count: "five" }) // en - string
      .mockResolvedValueOnce({ count: 5 }) // de - number (mismatch)
      .mockResolvedValueOnce({ count: 5 }); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context, { translator });

    expect(translator.translate).toHaveBeenCalledWith({
      text: "five",
      targetLocale: "de",
      sourceLocale: "en",
    });

    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[0]).toBe("de");
    expect(call[1]).toHaveProperty("count", "[de] five");
  });

  it("should translate multiple missing keys across multiple locales", async () => {
    const context = createMockContext();
    const translator = createMockTranslator();

    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ a: "Apple", b: "Banana" }) // en (analysis)
      .mockResolvedValueOnce({ a: "Apfel" }) // de (missing b)
      .mockResolvedValueOnce({ a: "Pomme" }) // fr (missing b)
      .mockResolvedValueOnce({ a: "Apfel" }) // de (correction)
      .mockResolvedValueOnce({ a: "Pomme" }); // fr (correction)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context, { translator });

    expect(translator.translate).toHaveBeenCalledTimes(2);
    expect(translator.translate).toHaveBeenCalledWith({
      text: "Banana",
      targetLocale: "de",
      sourceLocale: "en",
    });
    expect(translator.translate).toHaveBeenCalledWith({
      text: "Banana",
      targetLocale: "fr",
      sourceLocale: "en",
    });

    const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(deCall[1]).toHaveProperty("b", "[de] Banana");

    const frCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1]!;
    expect(frCall[1]).toHaveProperty("b", "[fr] Banana");
  });

  it("should not call translator for extra keys (just remove them)", async () => {
    const context = createMockContext();
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    const translator = createMockTranslator();

    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello" }) // en
      .mockResolvedValueOnce({ greeting: "Hallo", extra: "Nope" }) // de (extra key)
      .mockResolvedValueOnce({ greeting: "Hallo", extra: "Nope" }); // de (correction)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context, { translator });

    expect(translator.translate).not.toHaveBeenCalled();

    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[1]).not.toHaveProperty("extra");
  });

  it("should handle nested keys with translator", async () => {
    const context = createMockContext();
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    const translator = createMockTranslator();

    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ auth: { login: "Login", signup: "Sign Up" } }) // en
      .mockResolvedValueOnce({ auth: { login: "Anmelden" } }) // de (missing auth.signup)
      .mockResolvedValueOnce({ auth: { login: "Anmelden" } }); // de (correction)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context, { translator });

    expect(translator.translate).toHaveBeenCalledWith({
      text: "Sign Up",
      targetLocale: "de",
      sourceLocale: "en",
    });

    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[1]).toEqual({
      auth: { login: "Anmelden", signup: "[de] Sign Up" },
    });
  });

  it("should detect extra keys and remove them", async () => {
    const context = createMockContext();
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello" }) // en (analysis)
      .mockResolvedValueOnce({ greeting: "Hallo", extra: "Nope" }) // de (analysis - extra key)
      .mockResolvedValueOnce({ greeting: "Bonjour" }) // fr (analysis)
      .mockResolvedValueOnce({ greeting: "Hallo", extra: "Nope" }); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(1);
    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[0]).toBe("de");
    expect(call[1]).toHaveProperty("greeting", "Hallo");
    expect(call[1]).not.toHaveProperty("extra");
  });

  it("should detect type mismatches and reset to empty string without translator", async () => {
    const context = createMockContext();
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ count: "five" }) // en (analysis) - string
      .mockResolvedValueOnce({ count: 5 }) // de (analysis) - number (mismatch)
      .mockResolvedValueOnce({ count: 5 }); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(1);
    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[0]).toBe("de");
    expect(call[1]).toHaveProperty("count", "");
  });

  it("should handle flat key style", async () => {
    const context = createMockContext();
    context.config = {
      ...mockConfig,
      keyStyle: "flat",
      supportedLocales: ["en", "de"],
    };
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ "auth.login": "Login", "auth.signup": "Signup" }) // en
      .mockResolvedValueOnce({ "auth.login": "Anmelden" }) // de (missing auth.signup)
      .mockResolvedValueOnce({ "auth.login": "Anmelden" }); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(call[0]).toBe("de");
    expect(call[1]).toEqual({ "auth.login": "Anmelden", "auth.signup": "" });
  });

  it("should not modify files in dry run mode", async () => {
    const context = createMockContext({ dryRun: true });
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello" }) // en
      .mockResolvedValueOnce({}) // de (all keys missing)
      .mockResolvedValueOnce({}); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      { dryRun: true }
    );
  });

  it("should throw error in CI mode without yes flag", async () => {
    const context = createMockContext({ ci: true });
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello" }) // en
      .mockResolvedValueOnce({}); // de (missing key)

    await expect(validateCommand(context)).rejects.toThrow(
      "CI mode: validation found issues in 1 locale(s). Re-run with --yes to auto-correct."
    );
  });

  it("should auto-correct in CI mode with yes flag", async () => {
    const context = createMockContext({ ci: true, yes: true });
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello" }) // en
      .mockResolvedValueOnce({}) // de (missing key)
      .mockResolvedValueOnce({}); // de (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    expect(context.fileManager.writeLocale).toHaveBeenCalled();
  });

  it("should cancel when user declines confirmation", async () => {
    const context = createMockContext();
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello" }) // en
      .mockResolvedValueOnce({}); // de (missing key)
    vi.mocked(confirmAction).mockResolvedValue(false);

    await validateCommand(context);

    expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
  });

  it("should skip confirmation with yes flag", async () => {
    const context = createMockContext({ yes: true });
    context.config = { ...mockConfig, supportedLocales: ["en", "de"] };
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ greeting: "Hello" }) // en
      .mockResolvedValueOnce({}) // de
      .mockResolvedValueOnce({}); // de (correction)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    expect(confirmAction).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ skip: true })
    );
    expect(context.fileManager.writeLocale).toHaveBeenCalled();
  });

  it("should fix multiple locales with different issues", async () => {
    const context = createMockContext();
    vi.mocked(context.fileManager.readLocale)
      .mockResolvedValueOnce({ a: "A", b: "B" }) // en (analysis)
      .mockResolvedValueOnce({ a: "Aa" }) // de (analysis - missing b)
      .mockResolvedValueOnce({ a: "Aaa", b: "Bbb", c: "Ccc" }) // fr (analysis - extra c)
      .mockResolvedValueOnce({ a: "Aa" }) // de (correction read)
      .mockResolvedValueOnce({ a: "Aaa", b: "Bbb", c: "Ccc" }); // fr (correction read)
    vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

    await validateCommand(context);

    expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);

    const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
    expect(deCall[0]).toBe("de");
    expect(deCall[1]).toHaveProperty("a", "Aa");
    expect(deCall[1]).toHaveProperty("b", "");

    const frCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1]!;
    expect(frCall[0]).toBe("fr");
    expect(frCall[1]).toHaveProperty("a", "Aaa");
    expect(frCall[1]).toHaveProperty("b", "Bbb");
    expect(frCall[1]).not.toHaveProperty("c");
  });

  it("should handle single locale config (only default)", async () => {
    const context = createMockContext();
    context.config = { ...mockConfig, supportedLocales: ["en"] };
    vi.mocked(context.fileManager.readLocale).mockResolvedValueOnce({
      greeting: "Hello",
    });

    await validateCommand(context);

    expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
  });
});
