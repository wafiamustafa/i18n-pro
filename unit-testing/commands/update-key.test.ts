import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateKeyCommand } from '../../src/commands/update-key.js';
import { confirmAction } from '../../src/core/confirmation.js';
import type { CommandContext } from '../../src/context/types.js';
import type { I18nConfig } from '../../src/config/types.js';
import type { Translator } from '../../src/providers/translator.js';

// Mock confirmation module
vi.mock('../../src/core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

// Create mock translator
const createMockTranslator = (): Translator => ({
  name: 'mock',
  translate: vi.fn().mockImplementation(({ text, targetLocale }) =>
    Promise.resolve({ text: `[${targetLocale}] ${text}`, provider: 'mock' })
  )
});

describe('update:key command', () => {
  const mockConfig: I18nConfig = {
    localesPath: './locales',
    defaultLocale: 'en',
    supportedLocales: ['en', 'de'],
    keyStyle: 'nested',
    usagePatterns: [],
    compiledUsagePatterns: [],
    autoSort: true
  };

  const createMockContext = (options: Partial<CommandContext['options']> = {}): CommandContext => ({
    config: mockConfig,
    fileManager: {
      readLocale: vi.fn(),
      writeLocale: vi.fn()
    } as any,
    options: {
      yes: false,
      dryRun: false,
      ci: false,
      ...options
    }
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(confirmAction).mockResolvedValue(true);
  });

  describe('updateKeyCommand', () => {
    it('should throw error when key is empty', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      await expect(updateKeyCommand(context, '', { value: 'test' }, mockTranslator)).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should throw error when value is undefined', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      await expect(updateKeyCommand(context, 'test.key', { value: undefined as any }, mockTranslator)).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should update key in default locale', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi there' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'en',
        { greeting: 'Hi there' },
        { dryRun: false }
      );
    });

    it('should update key in specific locale', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hallo'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Guten Tag', locale: 'de' }, mockTranslator);

      expect(context.fileManager.readLocale).toHaveBeenCalledWith('de');
      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'de',
        { greeting: 'Guten Tag' },
        { dryRun: false }
      );
    });

    it('should throw error when key does not exist', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        other: 'value'
      });

      await expect(updateKeyCommand(context, 'nonexistent', { value: 'test' }, mockTranslator)).rejects.toThrow(
        'Key "nonexistent" does not exist in locale "en".'
      );
    });

    it('should throw error when locale is not supported', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      await expect(updateKeyCommand(context, 'greeting', { value: 'test', locale: 'es' }, mockTranslator)).rejects.toThrow(
        'Locale "es" is not defined in configuration.'
      );
    });

    it('should throw error on structural conflict', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth': 'value'
      });

      await expect(updateKeyCommand(context, 'auth.login', { value: 'test' }, mockTranslator)).rejects.toThrow(
        'Structural conflict detected'
      );
    });

    it('should update nested key with nested keyStyle', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login',
        'auth.login.button': 'Sign In'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'auth.login.title', { value: 'Sign In Page' }, mockTranslator);

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(call[1]).toEqual({
        auth: {
          login: {
            title: 'Sign In Page',
            button: 'Sign In'
          }
        }
      });
    });

    it('should update flat key with flat keyStyle', async () => {
      const flatConfig: I18nConfig = { ...mockConfig, keyStyle: 'flat' };
      const context = createMockContext();
      const mockTranslator = createMockTranslator();
      context.config = flatConfig;

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'auth.login.title', { value: 'Sign In Page' }, mockTranslator);

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(call[1]).toEqual({
        'auth.login.title': 'Sign In Page'
      });
    });

    it('should not modify file in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'en',
        { greeting: 'Hi' },
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });

      await expect(updateKeyCommand(context, 'greeting', { value: 'Hi' }, mockTranslator)).rejects.toThrow(
        'CI mode: key "greeting" would be updated in 1 locale(s). Re-run with --yes to apply.'
      );
    });

    it('should update in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(confirmAction).mockResolvedValue(false);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' }, mockTranslator);

      expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' }, mockTranslator);

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should handle empty string value', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: '' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'en',
        { greeting: '' },
        { dryRun: false }
      );
    });

    it('should preserve other keys when updating', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        farewell: 'Goodbye',
        welcome: 'Welcome'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' }, mockTranslator);

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(call[1]).toEqual({
        greeting: 'Hi',
        farewell: 'Goodbye',
        welcome: 'Welcome'
      });
    });

    it('should sync update to all locales with --sync flag', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({ greeting: 'Hello' })  // en validation
        .mockResolvedValueOnce({ greeting: 'Hallo' })  // de validation
        .mockResolvedValueOnce({ greeting: 'Hello' })  // en read for old value
        .mockResolvedValueOnce({ greeting: 'Hello' })  // en write
        .mockResolvedValueOnce({ greeting: 'Hallo' }); // de write

      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi', sync: true }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);

      // Check en locale gets the new value
      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[0]).toBe('en');
      expect(enCall[1]).toHaveProperty('greeting', 'Hi');

      // Check de locale gets translated value
      const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1]!;
      expect(deCall[0]).toBe('de');
      expect(deCall[1]).toHaveProperty('greeting', '[de] Hi');

      // Verify translator was called for non-target locale
      expect(mockTranslator.translate).toHaveBeenCalledWith({
        text: 'Hi',
        targetLocale: 'de',
        sourceLocale: 'en'
      });
    });

    it('should handle translation failures gracefully in sync mode', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      // Make translation fail for de locale
      vi.mocked(mockTranslator.translate).mockImplementation(({ targetLocale }) => {
        if (targetLocale === 'de') {
          return Promise.reject(new Error('Translation failed'));
        }
        return Promise.resolve({ text: `[${targetLocale}] translated`, provider: 'mock' });
      });

      // Set up mock to return different values based on locale
      vi.mocked(context.fileManager.readLocale).mockImplementation(async (locale: string) => {
        if (locale === 'en') {
          return { greeting: 'Hello' };
        }
        if (locale === 'de') {
          return { greeting: 'Hallo' };
        }
        return {};
      });

      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi', sync: true }, mockTranslator);

      // Should keep existing value for de when translation fails
      const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1]!;
      expect(deCall[0]).toBe('de');
      expect(deCall[1]).toHaveProperty('greeting', 'Hallo');
    });

    it('should throw error when key does not exist in non-target locale during sync', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({ greeting: 'Hello' })  // en validation
        .mockResolvedValueOnce({ other: 'value' });    // de validation - missing key

      await expect(updateKeyCommand(context, 'greeting', { value: 'Hi', sync: true }, mockTranslator)).rejects.toThrow(
        'Key "greeting" does not exist in locale "de".'
      );
    });

    it('should update a specific locale file with --locale fr without modifying default locale', async () => {
      const frConfig: I18nConfig = { ...mockConfig, supportedLocales: ['en', 'fr'] };
      const context = createMockContext();
      const mockTranslator = createMockTranslator();
      context.config = frConfig;

      vi.mocked(context.fileManager.readLocale).mockImplementation(async (locale: string) => {
        if (locale === 'fr') {
          return { greeting: 'Bonjour' };
        }
        return { greeting: 'Hello' };
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Salut', locale: 'fr' }, mockTranslator);

      // Should only write to fr locale
      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(1);
      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'fr',
        { greeting: 'Salut' },
        { dryRun: false }
      );

      // Should not write to en locale
      const calls = vi.mocked(context.fileManager.writeLocale).mock.calls;
      expect(calls.some(call => call[0] === 'en')).toBe(false);
    });

    it('should throw error when key does not exist in the target locale specified by --locale', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        other: 'value'
      });

      await expect(updateKeyCommand(context, 'nonexistent', { value: 'test', locale: 'de' }, mockTranslator)).rejects.toThrow(
        'Key "nonexistent" does not exist in locale "de".'
      );
    });

    it('should warn when both --locale and --sync are provided and only update the locale', async () => {
      const frConfig: I18nConfig = { ...mockConfig, supportedLocales: ['en', 'fr'] };
      const context = createMockContext();
      const mockTranslator = createMockTranslator();
      context.config = frConfig;

      vi.mocked(context.fileManager.readLocale).mockImplementation(async (locale: string) => {
        if (locale === 'fr') {
          return { greeting: 'Bonjour' };
        }
        return { greeting: 'Hello' };
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await updateKeyCommand(context, 'greeting', { value: 'Salut', locale: 'fr', sync: true }, mockTranslator);

      // Should warn about mutual exclusivity
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('--locale and --sync are mutually exclusive')
      );

      // Should only write to fr locale (no sync)
      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(1);
      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'fr',
        { greeting: 'Salut' },
        { dryRun: false }
      );

      // Should not translate or update other locales
      expect(mockTranslator.translate).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
