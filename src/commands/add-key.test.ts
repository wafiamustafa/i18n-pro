import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addKeyCommand } from './add-key.js';
import { confirmAction } from '../core/confirmation.js';
import type { CommandContext } from '../context/types.js';
import type { I18nConfig } from '../config/types.js';

// Mock confirmation module
vi.mock('../core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

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
      
      await expect(addKeyCommand(context, '', { value: 'test' })).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should throw error when value is empty', async () => {
      const context = createMockContext();
      
      await expect(addKeyCommand(context, 'test.key', { value: '' })).rejects.toThrow(
        'Both key and --value are required.'
      );
    });

    it('should add key to all locales', async () => {
      const context = createMockContext();
      // First pass (validation) + second pass (writing) = 4 reads for 2 locales
      vi.mocked(context.fileManager.readLocale)
        .mockResolvedValueOnce({})  // en - validation
        .mockResolvedValueOnce({})  // de - validation
        .mockResolvedValueOnce({})  // en - writing
        .mockResolvedValueOnce({}); // de - writing
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' });

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
      
      // Check en locale gets the value
      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0];
      expect(enCall[0]).toBe('en');
      expect(enCall[1]).toHaveProperty('greeting', 'Hello');
      
      // Check de locale gets empty string
      const deCall = vi.mocked(context.fileManager.writeLocale).mock.calls[1];
      expect(deCall[0]).toBe('de');
      expect(deCall[1]).toHaveProperty('greeting', '');
    });

    it('should throw error when key already exists', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        greeting: 'Existing'
      });

      await expect(addKeyCommand(context, 'greeting', { value: 'Hello' })).rejects.toThrow(
        'Key "greeting" already exists in locale "en". Use update:key instead.'
      );
    });

    it('should throw error on structural conflict (parent exists)', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth': 'value'
      });

      await expect(addKeyCommand(context, 'auth.login', { value: 'Login' })).rejects.toThrow(
        'Structural conflict detected'
      );
    });

    it('should throw error on structural conflict (child exists)', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({
        'auth.login.title': 'Login'
      });

      await expect(addKeyCommand(context, 'auth.login', { value: 'Auth' })).rejects.toThrow(
        'Structural conflict detected'
      );
    });

    it('should add nested key with nested keyStyle', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'auth.login.title', { value: 'Login Page' });

      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0];
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
      context.config = flatConfig;
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'auth.login.title', { value: 'Login Page' });

      const enCall = vi.mocked(context.fileManager.writeLocale).mock.calls[0];
      expect(enCall[1]).toEqual({
        'auth.login.title': 'Login Page'
      });
    });

    it('should not modify files in dry run mode', async () => {
      const context = createMockContext({ dryRun: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' });

      expect(context.fileManager.writeLocale).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { dryRun: true }
      );
    });

    it('should throw error in CI mode without yes flag', async () => {
      const context = createMockContext({ ci: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});

      await expect(addKeyCommand(context, 'greeting', { value: 'Hello' })).rejects.toThrow(
        'CI mode: key "greeting" would be added to 2 locale(s). Re-run with --yes to apply.'
      );
    });

    it('should add key in CI mode with yes flag', async () => {
      const context = createMockContext({ ci: true, yes: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' });

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
    });

    it('should cancel operation when user declines confirmation', async () => {
      const context = createMockContext();
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(confirmAction).mockResolvedValue(false);

      await addKeyCommand(context, 'greeting', { value: 'Hello' });

      expect(context.fileManager.writeLocale).not.toHaveBeenCalled();
    });

    it('should skip confirmation with yes flag', async () => {
      const context = createMockContext({ yes: true });
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' });

      // confirmAction is called with skip: true when yes flag is set
      expect(confirmAction).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ skip: true })
      );
      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple locales', async () => {
      const multiConfig: I18nConfig = {
        ...mockConfig,
        supportedLocales: ['en', 'de', 'fr', 'es']
      };
      const context = createMockContext();
      context.config = multiConfig;
      
      vi.mocked(context.fileManager.readLocale).mockResolvedValue({});
      vi.mocked(context.fileManager.writeLocale).mockResolvedValue(undefined);

      await addKeyCommand(context, 'greeting', { value: 'Hello' });

      expect(context.fileManager.writeLocale).toHaveBeenCalledTimes(4);
      
      // Only default locale gets the value
      const calls = vi.mocked(context.fileManager.writeLocale).mock.calls;
      const enCall = calls.find(call => call[0] === 'en');
      const otherCalls = calls.filter(call => call[0] !== 'en');
      
      expect(enCall![1]).toHaveProperty('greeting', 'Hello');
      otherCalls.forEach(call => {
        expect(call[1]).toHaveProperty('greeting', '');
      });
    });
  });
});
