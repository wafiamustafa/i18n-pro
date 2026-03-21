import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateKeyCommand } from './update-key.js';
import { confirmAction } from '../core/confirmation.js';
import type { CommandContext } from '../context/types.js';
import type { I18nConfig } from '../config/types.js';

// Mock confirmation module
vi.mock('../core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

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
      
      await expect(updateKeyCommand(context, '', { value: 'test' })).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should throw error when value is undefined', async () => {
      const context = createMockContext();
      
      await expect(updateKeyCommand(context, 'test.key', { value: undefined as any })).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should update key in default locale', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi there' });

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'en',
        { greeting: 'Hi there' },
        { dryRun: false }
      );
    });

    it('should update key in specific locale', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hallo'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Guten Tag', locale: 'de' });

      expect(context.fileManager.readLocale).toHaveBeenCalledWith('de');
      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'de',
        { greeting: 'Guten Tag' },
        { dryRun: false }
      );
    });

    it('should throw error when key does not exist', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        other: 'value'
      });

      await expect(updateKeyCommand(context, 'nonexistent', { value: 'test' })).rejects.toThrow(
        'Key "nonexistent" does not exist in locale "en".'
      );
    });

    it('should throw error when locale is not supported', async () => {
      const context = createMockContext();

      await expect(updateKeyCommand(context, 'greeting', { value: 'test', locale: 'es' })).rejects.toThrow(
        'Locale "es" is not defined in configuration.'
      );
    });

    it('should throw error on structural conflict', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth': 'value'
      });

      await expect(updateKeyCommand(context, 'auth.login', { value: 'test' })).rejects.toThrow(
        'Structural conflict detected'
      );
    });

    it('should update nested key with nested keyStyle', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login',
        'auth.login.button': 'Sign In'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'auth.login.title', { value: 'Sign In Page' });

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
      context.config = flatConfig;
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'auth.login.title', { value: 'Sign In Page' });

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(call[1]).toEqual({
        'auth.login.title': 'Sign In Page'
      });
    });

    it('should not modify file in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' });

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'en',
        { greeting: 'Hi' },
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });

      await expect(updateKeyCommand(context, 'greeting', { value: 'Hi' })).rejects.toThrow(
        'CI mode: key "greeting" in "en" would be updated. Re-run with --yes to apply.'
      );
    });

    it('should update in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' });

      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(confirmAction).mockResolvedValue(false);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' });

      expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' });

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.writeLocale).toHaveBeenCalled();
    });

    it('should handle empty string value', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: '' });

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        'en',
        { greeting: '' },
        { dryRun: false }
      );
    });

    it('should preserve other keys when updating', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Hello',
        farewell: 'Goodbye',
        welcome: 'Welcome'
      });
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await updateKeyCommand(context, 'greeting', { value: 'Hi' });

      const call = vi.mocked(context.fileManager.writeLocale).mock.calls[0]!;
      expect(call[1]).toEqual({
        greeting: 'Hi',
        farewell: 'Goodbye',
        welcome: 'Welcome'
      });
    });
  });
});
