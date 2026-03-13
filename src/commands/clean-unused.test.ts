import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanUnusedCommand } from './clean-unused.js';
import { confirmAction } from '../core/confirmation.js';
import fs from 'fs-extra';
import { glob } from 'glob';
import type { CommandContext } from '../context/types.js';
import type { I18nConfig } from '../config/types.js';

// Mock dependencies
vi.mock('../core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

vi.mock('fs-extra', () => {
  return {
    default: {
      readFile: vi.fn(() => Promise.resolve(''))
    }
  };
});

vi.mock('glob', () => {
  return {
    glob: vi.fn(() => Promise.resolve([]))
  };
});

describe('clean:unused command', () => {
  const mockConfig: I18nConfig = {
    localesPath: './locales',
    defaultLocale: 'en',
    supportedLocales: ['en', 'de'],
    keyStyle: 'nested',
    usagePatterns: [],
    compiledUsagePatterns: [
      /t\(['"](?<key>.+?)['"]\)/g,
      /i18n\.t\(['"](?<key>.+?)['"]\)/g
    ],
    autoSort: true
  };

  const createMockContext = (options: Partial<CommandContext['options']> = {}): CommandContext => ({
    config: { ...mockConfig }, // Create a copy to avoid mutation issues
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
    vi.mocked(glob).mockResolvedValue([]);
  });

  describe('cleanUnusedCommand', () => {
    it('should throw error when no usage patterns defined', async () => {
      const context = createMockContext();
      context.config.compiledUsagePatterns = [];

      await expect(cleanUnusedCommand(context)).rejects.toThrow(
        'No usagePatterns defined in config.'
      );
    });

    it('should return early when no unused keys found', async () => {
      const context = createMockContext();
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });

      await cleanUnusedCommand(context);

      expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
    });

    it('should remove unused keys from all locales', async () => {
      const context = createMockContext();
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      
      // Read order: default locale (en) first for analysis, then all locales for processing
      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({
          greeting: 'Hello',
          unused: 'Not used',
          alsoUnused: 'Also not used'
        })  // en - read for analysis (default locale)
        .mockResolvedValueOnce({
          greeting: 'Hello',
          unused: 'Not used',
          alsoUnused: 'Also not used'
        })  // en - processed
        .mockResolvedValueOnce({
          greeting: 'Hallo',
          unused: 'Nicht verwendet',
          alsoUnused: 'Auch nicht verwendet'
        })  // de - processed
        .mockResolvedValue({});
      
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
      
      // Check en locale
      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[0]).toBe('en');
      expect(enCall[1]).toEqual({ greeting: 'Hello' });
      
      // Check de locale
      const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1]!;
      expect(deCall[0]).toBe('de');
      expect(deCall[1]).toEqual({ greeting: 'Hallo' });
    });

    it('should scan multiple files', async () => {
      const context = createMockContext();
      vi.mocked(glob).mockResolvedValue(['src/app.ts', 'src/components/Button.ts']);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce("t('greeting')")
        .mockResolvedValueOnce("t('button.label')");
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        'button.label': 'Click',
        unused: 'Not used'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      // Should keep greeting and button.label, remove unused
      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(call[1]).toEqual({
        greeting: 'Hello',
        button: { label: 'Click' }
      });
    });

    it('should extract keys from different patterns', async () => {
      const context = createMockContext();
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue(`
        t('key1')
        i18n.t('key2')
        translate('key3')
      `);
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        key1: 'Value 1',
        key2: 'Value 2',
        unused: 'Not used'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(call[1]).toHaveProperty('key1');
      expect(call[1]).toHaveProperty('key2');
      expect(call[1]).not.toHaveProperty('unused');
    });

    it('should handle named capture groups', async () => {
      const context = createMockContext();
      context.config.compiledUsagePatterns = [
        /t\(['"](?<key>.+?)['"]\)/g
      ];
      
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('my.key')");
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'my.key': 'Value',
        unused: 'Not used'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      // With nested keyStyle, the output is nested
      expect(call[1]).toEqual({ my: { key: 'Value' } });
    });

    it('should not modify files in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        unused: 'Not used'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        unused: 'Not used'
      });

      await expect(cleanUnusedCommand(context)).rejects.toThrow(
        'CI mode: 1 unused key(s) would be removed. Re-run with --yes to apply.'
      );
    });

    it('should clean in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        unused: 'Not used'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        unused: 'Not used'
      });
      vi.mocked(confirmAction).mockResolvedValue(false);

      await cleanUnusedCommand(context);

      expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        unused: 'Not used'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should handle nested keys', async () => {
      const context = createMockContext();
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('auth.login.title')");
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login',
        'auth.login.button': 'Sign In',
        'unused': 'Not used'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0];
      expect(call[1]).toEqual({
        auth: {
          login: {
            title: 'Login'
          }
        }
      });
    });

    it('should handle multiple locales', async () => {
      const multiConfig: I18nConfig = {
        ...mockConfig,
        supportedLocales: ['en', 'de', 'fr']
      };
      const context = createMockContext();
      context.config = multiConfig;
      
      vi.mocked(glob).mockResolvedValue(['src/app.ts']);
      vi.mocked(fs.readFile).mockResolvedValue("t('greeting')");
      
      // default locale is read first, then all locales are processed
      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({ greeting: 'Hello', unused: 'x' })  // default locale read
        .mockResolvedValueOnce({ greeting: 'Hello', unused: 'x' })  // en
        .mockResolvedValueOnce({ greeting: 'Hallo', unused: 'x' })  // de
        .mockResolvedValueOnce({ greeting: 'Bonjour', unused: 'x' }); // fr
      
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await cleanUnusedCommand(context);

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(3);
    });

    it('should handle no matching files', async () => {
      const context = createMockContext();
      vi.mocked(glob).mockResolvedValue([]);
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });

      await cleanUnusedCommand(context);

      // All keys are unused since no files were scanned
      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });
  });
});
