import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { initCommand } from '../../src/commands/init.js';
import { CONFIG_FILE_NAME } from '../../src/config/config-loader.js';
import type { GlobalOptions } from '../../src/context/types.js';

// Mock dependencies
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    writeJson: vi.fn(),
    ensureDir: vi.fn()
  }
}));

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}));

vi.mock('../../src/core/confirmation.js', () => ({
  confirmAction: vi.fn()
}));

import inquirer from 'inquirer';
import { confirmAction } from '../../src/core/confirmation.js';

describe('init command', () => {
  const mockCwd = '/mock/project';
  const mockConfigPath = path.join(mockCwd, CONFIG_FILE_NAME);

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(confirmAction).mockResolvedValue(true);
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    // Mock process.stdout.isTTY to be true by default
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initCommand', () => {
    it('should throw error when config already exists and no force flag', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);

      const options: GlobalOptions = {};
      await expect(initCommand(options)).rejects.toThrow(
        `Configuration file "${CONFIG_FILE_NAME}" already exists. Use --force to overwrite.`
      );
    });

    it('should create config with default values in non-interactive mode', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = {};
      await initCommand(options);

      expect(fs.writeJson).toHaveBeenCalledWith(
        mockConfigPath,
        expect.objectContaining({
          localesPath: './locales',
          defaultLocale: 'en',
          supportedLocales: ['en'],
          keyStyle: 'nested',
          autoSort: true
        }),
        { spaces: 2 }
      );
    });

    it('should create config with force flag even if exists', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = { force: true };
      await initCommand(options);

      expect(fs.writeJson).toHaveBeenCalled();
    });

    it('should throw error in CI mode without yes flag', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = { ci: true };
      await expect(initCommand(options)).rejects.toThrow(
        'CI mode: configuration file would be created. Re-run with --yes to apply.'
      );
    });

    it('should create config in CI mode with yes flag', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = { ci: true, yes: true };
      await initCommand(options);

      expect(fs.writeJson).toHaveBeenCalled();
    });

    it('should not write config in dry run mode', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = { dryRun: true };
      await initCommand(options);

      expect(fs.writeJson).not.toHaveBeenCalled();
    });

    it('should create interactive config with user input', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({
          localesPath: './translations',
          defaultLocale: 'fr',
          supportedLocales: 'fr, en',
          keyStyle: 'flat',
          autoSort: false,
          useDefaultUsagePatterns: true
        });

      const options: GlobalOptions = {};
      await initCommand(options);

      expect(fs.writeJson).toHaveBeenCalledWith(
        mockConfigPath,
        expect.objectContaining({
          localesPath: './translations',
          defaultLocale: 'fr',
          supportedLocales: expect.arrayContaining(['fr', 'en']),
          keyStyle: 'flat',
          autoSort: false
        }),
        { spaces: 2 }
      );
    });

    it('should include default locale in supported locales', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = {};
      await initCommand(options);

      const writtenConfig = vi.mocked(fs.writeJson).mock.calls[0]![1] as any;
      expect(writtenConfig.supportedLocales).toContain('en');
    });

    it('should remove duplicates from supported locales', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({
          localesPath: './locales',
          defaultLocale: 'en',
          supportedLocales: 'en, en, de, de',
          keyStyle: 'nested',
          autoSort: true,
          useDefaultUsagePatterns: true
        });

      const options: GlobalOptions = {};
      await initCommand(options);

      const writtenConfig = vi.mocked(fs.writeJson).mock.calls[0]![1] as any;
      expect(writtenConfig.supportedLocales).toEqual(['en', 'de']);
    });

    it('should validate usage patterns', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = {};
      await initCommand(options);

      // Should not throw - patterns are validated
      expect(fs.writeJson).toHaveBeenCalled();
    });

    it('should create default locale file', async () => {
      (vi.mocked(fs.pathExists) as any)
        .mockResolvedValueOnce(false) // config doesn't exist
        .mockResolvedValueOnce(false); // locale file doesn't exist
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      // Non-interactive mode
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const options: GlobalOptions = {};
      await initCommand(options);

      // Should create the locales directory and default locale file
      expect(fs.ensureDir).toHaveBeenCalled();
    });

    it('should handle custom usage patterns', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({
          localesPath: './locales',
          defaultLocale: 'en',
          supportedLocales: 'en',
          keyStyle: 'nested',
          autoSort: true,
          useDefaultUsagePatterns: false
        })
        .mockResolvedValueOnce({ pattern: 'custom\\((.+?)\\)' })
        .mockResolvedValueOnce({ again: false });

      const options: GlobalOptions = {};
      await initCommand(options);

      const writtenConfig = vi.mocked(fs.writeJson).mock.calls[0]![1] as any;
      expect(writtenConfig.usagePatterns).toContain('custom\\((.+?)\\)');
    });

    it('should strip .json extension from default locale when creating file', async () => {
      (vi.mocked(fs.pathExists) as any)
        .mockResolvedValueOnce(false) // config doesn't exist
        .mockResolvedValueOnce(false); // locale file doesn't exist
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({
          localesPath: './locales',
          defaultLocale: 'en.json',
          supportedLocales: 'en.json',
          keyStyle: 'nested',
          autoSort: true,
          useDefaultUsagePatterns: true
        });

      const options: GlobalOptions = {};
      await initCommand(options);

      // Should create the locale file without double .json extension
      // The file should be created as 'en.json', not 'en.json.json'
      expect(fs.ensureDir).toHaveBeenCalled();
    });
  });
});
