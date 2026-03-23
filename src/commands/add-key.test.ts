import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addKeyCommand } from './add-key.js';
import { confirmAction } from '../core/confirmation.js';
import type { CommandContext } from '../context/types.js';
import type { I18nConfig } from '../config/types.js';
import type { Translator } from '../providers/translator.js';

// Mock confirmation module
vi.mock('../core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

// Create mock translator
const createMockTranslator = (): Translator => ({
  name: 'mock',
  translate: vi.fn().mockImplementation(({ text, targetLocale }) =>
    Promise.resolve({ text: `[${targetLocale}] ${text}`, provider: 'mock' })
  )
});

describe('add:key command', () => {
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

  describe('addKeyCommand', () => {
    it('should throw error when key is empty', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      await expect(addKeyCommand(context, '', { value: 'test' }, mockTranslator)).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should throw error when value is empty', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      await expect(addKeyCommand(context, 'test.key', { value: '' }, mockTranslator)).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should add key to all locales with translation', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      // First pass (validation) + second pass (writing) = 4 reads for 2 locales
      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({})  // en - validation
        .mockResolvedValueOnce({})  // de - validation
        .mockResolvedValueOnce({})  // en - writing
        .mockResolvedValueOnce({}); // de - writing
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);

      // Check en locale gets the original value
      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[0]).toBe('en');
      expect(enCall[1]).toHaveProperty('greeting', 'Hello');

      // Check de locale gets translated value
      const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1]!;
      expect(deCall[0]).toBe('de');
      expect(deCall[1]).toHaveProperty('greeting', '[de] Hello');

      // Verify translator was called for non-default locale
      expect(mockTranslator.translate).toHaveBeenCalledWith({
        text: 'Hello',
        targetLocale: 'de',
        sourceLocale: 'en'
      });
    });

    it('should throw error when key already exists', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Existing'
      });

      await expect(addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator)).rejects.toThrow(
        'Key "greeting" already exists in locale "en". Use update:key instead.'
      );
    });

    it('should throw error on structural conflict (parent exists)', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth': 'value'
      });

      await expect(addKeyCommand(context, 'auth.login', { value: 'Login' }, mockTranslator)).rejects.toThrow(
        'Structural conflict detected'
      );
    });

    it('should throw error on structural conflict (child exists)', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login'
      });

      await expect(addKeyCommand(context, 'auth.login', { value: 'Auth' }, mockTranslator)).rejects.toThrow(
        'Structural conflict detected'
      );
    });

    it('should add nested key with nested keyStyle', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'auth.login.title', { value: 'Login Page' }, mockTranslator);

      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[1]).toEqual({
        auth: {
          login: {
            title: 'Login Page'
          }
        }
      });
    });

    it('should add flat key with flat keyStyle', async () => {
      const flatConfig: I18nConfig = { ...mockConfig, keyStyle: 'flat' };
      const context = createMockContext();
      const mockTranslator = createMockTranslator();
      context.config = flatConfig;

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'auth.login.title', { value: 'Login Page' }, mockTranslator);

      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[1]).toEqual({
        'auth.login.title': 'Login Page'
      });
    });

    it('should not modify files in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});

      await expect(addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator)).rejects.toThrow(
        'CI mode: key "greeting" would be added to 2 locale(s). Re-run with --yes to apply.'
      );
    });

    it('should add key in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(confirmAction).mockResolvedValue(false);

      await addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator);

      expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      const mockTranslator = createMockTranslator();

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator);

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple locales with translation', async () => {
      const multiConfig: I18nConfig = {
        ...mockConfig,
        supportedLocales: ['en', 'de', 'fr', 'es']
      };
      const context = createMockContext();
      const mockTranslator = createMockTranslator();
      context.config = multiConfig;

      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator);

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(4);

      // Default locale gets the original value, others get translated
      const calls = vi.mocked(context.fileManager.writeLocale).mock.calls;
      const enCall = calls.find(call => call[0] === 'en');
      const deCall = calls.find(call => call[0] === 'de');
      const frCall = calls.find(call => call[0] === 'fr');
      const esCall = calls.find(call => call[0] === 'es');

      expect(enCall![1]).toHaveProperty('greeting', 'Hello');
      expect(deCall![1]).toHaveProperty('greeting', '[de] Hello');
      expect(frCall![1]).toHaveProperty('greeting', '[fr] Hello');
      expect(esCall![1]).toHaveProperty('greeting', '[es] Hello');

      // Verify translator was called for all non-default locales
      expect(mockTranslator.translate).toHaveBeenCalledTimes(3);
    });

    it('should handle translation failures gracefully', async () => {
      const context = createMockContext();
      const mockTranslator = createMockTranslator();

      // Make translation fail for de locale
      vi.mocked(mockTranslator.translate).mockImplementation(({ targetLocale }) => {
        if (targetLocale === 'de') {
          return Promise.reject(new Error('Translation failed'));
        }
        return Promise.resolve({ text: `[${targetLocale}] translated`, provider: 'mock' });
      });

      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({})  // en - validation
        .mockResolvedValueOnce({})  // de - validation
        .mockResolvedValueOnce({})  // en - writing
        .mockResolvedValueOnce({}); // de - writing
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' }, mockTranslator);

      // Should still write to both locales, with empty string for failed translation
      const calls = vi.mocked(context.fileManager.writeLocale).mock.calls;
      const deCall = calls.find(call => call[0] === 'de');
      expect(deCall![1]).toHaveProperty('greeting', '');
    });
  });
});
