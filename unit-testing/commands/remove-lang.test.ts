import { describe, it, expect, beforeEach, vi } from 'vitest';
import { removeLangCommand } from '../../src/commands/remove-lang.js';
import { confirmAction } from '../../src/core/confirmation.js';
import type { CommandContext } from '../../src/context/types.js';
import type { I18nConfig } from '../../src/config/types.js';

// Mock confirmation module
vi.mock('../../src/core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

describe('remove:lang command', () => {
  const mockConfig: I18nConfig = {
    localesPath: './locales',
    defaultLocale: 'en',
    supportedLocales: ['en', 'de', 'fr'],
    keyStyle: 'nested',
    usagePatterns: [],
    compiledUsagePatterns: [],
    autoSort: true
  };

  const createMockContext = (options: Partial<CommandContext['options']> = {}): CommandContext => ({
    config: mockConfig,
    fileManager: {
      localeExists: vi.fn(),
      deleteLocale: vi.fn()
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

  describe('removeLangCommand', () => {
    it('should throw error when locale not in supportedLocales', async () => {
      const context = createMockContext();
      
      await expect(removeLangCommand(context, 'es')).rejects.toThrow(
        'Locale "es" is not in supportedLocales.'
      );
    });

    it('should throw error when removing default locale', async () => {
      const context = createMockContext();
      
      await expect(removeLangCommand(context, 'en')).rejects.toThrow(
        'Cannot remove default locale "en". Change defaultLocale first.'
      );
    });

    it('should throw error when locale file does not exist', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(false);
      
      await expect(removeLangCommand(context, 'de')).rejects.toThrow(
        'Locale file "de.json" does not exist.'
      );
    });

    it('should delete locale file', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);
      vi.mocked(context.fileManager.deleteLocale).mockResolvedValue(undefined);

      await removeLangCommand(context, 'de');

      expect(context.fileManager.deleteLocale).toHaveBeenCalledWith(
        'de',
        { dryRun: false }
      );
    });

    it('should not delete in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);
      vi.mocked(context.fileManager.deleteLocale).mockResolvedValue(undefined);

      await removeLangCommand(context, 'de');

      expect(context.fileManager.deleteLocale).toHaveBeenCalledWith(
        'de',
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);

      await expect(removeLangCommand(context, 'de')).rejects.toThrow(
        'CI mode: locale "de" would be removed. Re-run with --yes to apply.'
      );
    });

    it('should delete in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);
      vi.mocked(context.fileManager.deleteLocale).mockResolvedValue(undefined);

      await removeLangCommand(context, 'de');

      expect(context.fileManager.deleteLocale).toHaveBeenCalled();
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);
      vi.mocked(confirmAction).mockResolvedValue(false);

      await removeLangCommand(context, 'de');

      expect(context.fileManager.deleteLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);
      vi.mocked(context.fileManager.deleteLocale).mockResolvedValue(undefined);

      await removeLangCommand(context, 'de');

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.deleteLocale).toHaveBeenCalled();
    });

    it('should trim whitespace from locale code', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.localeExists).mockResolvedValue(true);
      vi.mocked(context.fileManager.deleteLocale).mockResolvedValue(undefined);

      await removeLangCommand(context, '  de  ');

      expect(context.fileManager.deleteLocale).toHaveBeenCalledWith(
        'de',
        { dryRun: false }
      );
    });

    it('should work with different locales', async () => {
      const configWithMoreLocales: I18nConfig = {
        ...mockConfig,
        supportedLocales: ['en', 'de', 'fr', 'es', 'it']
      };

      for (const locale of ['de', 'fr', 'es', 'it']) {
        const context: CommandContext = {
          config: configWithMoreLocales,
          fileManager: {
            localeExists: vi.fn().mockResolvedValue(true),
            deleteLocale: vi.fn().mockResolvedValue(undefined)
          } as any,
          options: { yes: true }
        };

        await removeLangCommand(context, locale);
        expect(context.fileManager.deleteLocale).toHaveBeenCalledWith(
          locale,
          { dryRun: false }
        );
      }
    });
  });
});
