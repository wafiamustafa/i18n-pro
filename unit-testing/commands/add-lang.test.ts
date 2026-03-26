import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addLang } from '../../src/commands/add-lang.js';
import { confirmAction } from '../../src/core/confirmation.js';
import type { CommandContext } from '../../src/context/types.js';
import type { I18nConfig } from '../../src/config/types.js';

// Mock confirmation module
vi.mock('../../src/core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

describe('add:lang command', () => {
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
      localeExists: vi.fn(),
      createLocale: vi.fn(),
      readLocale: vi.fn()
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

  describe('addLang', () => {
    it('should throw error for invalid locale code', async () => {
      const context = createMockContext();
      
      await expect(addLang('invalid-locale-code', {}, context)).rejects.toThrow(
        'Invalid language code: invalid-locale-code'
      );
    });

    it('should throw error when locale already in supportedLocales', async () => {
      const context = createMockContext();
      
      await expect(addLang('en', {}, context)).rejects.toThrow(
        'Language en already exists'
      );
    });

    it('should throw error when locale file already exists', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);
      
      await expect(addLang('fr', {}, context)).rejects.toThrow(
        'File already exists: fr.json'
      );
    });

    it('should create new locale with empty content', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      await addLang('fr', {}, context);

      expect(context.fileManager.createLocale).toHaveBeenCalledWith(
        'fr',
        {},
        { dryRun: false }
      );
    });

    it('should clone from existing locale when --from option provided', async () => {
      const context = createMockContext();
      const baseContent = { greeting: 'Hello', farewell: 'Goodbye' };
      
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.readLocale).mockResolvedValue(baseContent);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      await addLang('fr', { from: 'en' }, context);

      expect(context.fileManager.readLocale).toHaveBeenCalledWith('en');
      expect(context.fileManager.createLocale).toHaveBeenCalledWith(
        'fr',
        baseContent,
        { dryRun: false }
      );
    });

    it('should throw error when cloning from non-existent locale', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);

      await expect(addLang('fr', { from: 'es' }, context)).rejects.toThrow(
        'Base locale es does not exist'
      );
    });

    it('should not create locale in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);

      await addLang('fr', {}, context);

      expect(context.fileManager.createLocale).toHaveBeenCalledWith(
        'fr',
        {},
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);

      await expect(addLang('fr', {}, context)).rejects.toThrow(
        'CI mode: locale "fr" would be created. Re-run with --yes to apply.'
      );
    });

    it('should create locale in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      await addLang('fr', {}, context);

      expect(context.fileManager.createLocale).toHaveBeenCalled();
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(confirmAction).mockResolvedValue(false);

      await addLang('fr', {}, context);

      expect(context.fileManager.createLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      await addLang('fr', {}, context);

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.createLocale).toHaveBeenCalled();
    });

    it('should accept valid ISO 639-1 language codes', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      // Test various valid codes (not in supportedLocales)
      await addLang('es', {}, context);
      await addLang('fr', {}, context);
      await addLang('it', {}, context);
      await addLang('zh', {}, context);
      await addLang('ar', {}, context);

      expect(context.fileManager.createLocale).toHaveBeenCalledTimes(5);
    });

    it('should accept locale codes with region', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      await addLang('en-US', {}, context);
      await addLang('pt-BR', {}, context);
      await addLang('zh-CN', {}, context);

      expect(context.fileManager.createLocale).toHaveBeenCalledTimes(3);
    });

    it('should trim whitespace from locale code', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      await addLang('  fr  ', {}, context);

      expect(context.fileManager.createLocale).toHaveBeenCalledWith(
        'fr',
        {},
        { dryRun: false }
      );
    });

    it('should pass strict option (for future use)', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      vi.mocked(context.fileManager.createLocale).mockResolvedValue(undefined);

      // strict option is accepted but currently doesn't change behavior
      await addLang('fr', { strict: true }, context);

      expect(context.fileManager.createLocale).toHaveBeenCalled();
    });
  });
});
