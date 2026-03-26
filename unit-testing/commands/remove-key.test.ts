import { describe, it, expect, beforeEach, vi } from 'vitest';
import { removeKeyCommand } from '../../src/commands/remove-key.js';
import { confirmAction } from '../../src/core/confirmation.js';
import type { CommandContext } from '../../src/context/types.js';
import type { I18nConfig } from '../../src/config/types.js';

// Mock confirmation module
vi.mock('../../src/core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

describe('remove:key command', () => {
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

  describe('removeKeyCommand', () => {
    it('should throw error when key is empty', async () => {
      const context = createMockContext();
      
      await expect(removeKeyCommand(context, '')).rejects.toThrow(
        'Key is required.'
      );
    });

    it('should throw error when key does not exist in any locale', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        other: 'value'
      });

      await expect(removeKeyCommand(context, 'nonexistent')).rejects.toThrow(
        'Key "nonexistent" does not exist in any locale.'
      );
    });

    it('should remove key from all locales', async () => {
      const context = createMockContext();
      // First pass (checking) + second pass (removing) = 4 reads for 2 locales
      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({ greeting: 'Hello', other: 'value' })  // en - check
        .mockResolvedValueOnce({ greeting: 'Hallo', other: 'wert' })   // de - check
        .mockResolvedValueOnce({ greeting: 'Hello', other: 'value' })  // en - remove
        .mockResolvedValueOnce({ greeting: 'Hallo', other: 'wert' });  // de - remove
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'greeting');

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
      
      // Check en locale
      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[0]).toBe('en');
      expect(enCall[1]).not.toHaveProperty('greeting');
      expect(enCall[1]).toHaveProperty('other');
      
      // Check de locale
      const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1]!;
      expect(deCall[0]).toBe('de');
      expect(deCall[1]).not.toHaveProperty('greeting');
      expect(deCall[1]).toHaveProperty('other');
    });

    it('should remove key only from locales that have it', async () => {
      const context = createMockContext();
      // First pass (checking) + second pass (removing) = 4 reads for 2 locales
      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({ greeting: 'Hello' })   // en - check
        .mockResolvedValueOnce({ other: 'value' })      // de - check (no greeting)
        .mockResolvedValueOnce({ greeting: 'Hello' })   // en - remove
        .mockResolvedValueOnce({ other: 'value' });     // de - remove (no greeting)
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'greeting');

      // Should still process both locales
      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
    });

    it('should remove nested key with nested keyStyle', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login',
        'auth.login.button': 'Sign In',
        'auth.register.title': 'Register'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'auth.login.title');

      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[1]).toEqual({
        auth: {
          login: {
            button: 'Sign In'
          },
          register: {
            title: 'Register'
          }
        }
      });
    });

    it('should remove flat key with flat keyStyle', async () => {
      const flatConfig: I18nConfig = { ...mockConfig, keyStyle: 'flat' };
      const context = createMockContext();
      context.config = flatConfig;
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login',
        'auth.login.button': 'Sign In'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'auth.login.title');

      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(enCall[1]).toEqual({
        'auth.login.button': 'Sign In'
      });
    });

    it('should remove empty parent objects with nested keyStyle', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'auth.login.title');

      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      // Empty objects should be removed
      expect(enCall[1]).toEqual({});
    });

    it('should not modify files in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'greeting');

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });

      await expect(removeKeyCommand(context, 'greeting')).rejects.toThrow(
        /CI mode: key "greeting" would be removed from \d+ locale\(s\). Re-run with --yes to apply./
      );
    });

    it('should remove key in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'greeting');

      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(confirmAction).mockResolvedValue(false);

      await removeKeyCommand(context, 'greeting');

      expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'greeting');

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should handle multiple locales', async () => {
      const multiConfig: I18nConfig = {
        ...mockConfig,
        supportedLocales: ['en', 'de', 'fr', 'es']
      };
      const context = createMockContext();
      context.config = multiConfig;
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        other: 'value'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await removeKeyCommand(context, 'greeting');

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(4);
    });
  });
});
