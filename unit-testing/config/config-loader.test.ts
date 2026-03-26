import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig, compileUsagePatterns, CONFIG_FILE_NAME } from '../../src/config/config-loader.js';
import type { I18nConfig } from '../../src/config/types.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readJson: vi.fn()
  }
}));

describe('config-loader', () => {
  const mockCwd = '/mock/project';
  const mockConfigPath = path.join(mockCwd, CONFIG_FILE_NAME);

  beforeEach(() => {
    vi.resetAllMocks();
    process.cwd = vi.fn().mockReturnValue(mockCwd);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadConfig', () => {
    it('should throw error when config file does not exist', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);

      await expect(loadConfig()).rejects.toThrow(
        `Configuration file "${CONFIG_FILE_NAME}" not found in project root`
      );
    });

    it('should throw error when config file contains invalid JSON', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockRejectedValue(new Error('Invalid JSON'));

      await expect(loadConfig()).rejects.toThrow(
        `Failed to parse ${CONFIG_FILE_NAME}. Ensure it contains valid JSON.`
      );
    });

    it('should throw error when config has missing required fields', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales'
        // missing other required fields
      });

      await expect(loadConfig()).rejects.toThrow('Invalid configuration');
    });

    it('should throw error when defaultLocale is not in supportedLocales', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales',
        defaultLocale: 'fr',
        supportedLocales: ['en', 'de'],
        keyStyle: 'nested',
        usagePatterns: [],
        autoSort: true
      });

      await expect(loadConfig()).rejects.toThrow(
        'defaultLocale "fr" must be included in supportedLocales'
      );
    });

    it('should throw error when supportedLocales contains duplicates', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales',
        defaultLocale: 'en',
        supportedLocales: ['en', 'en', 'de'],
        keyStyle: 'nested',
        usagePatterns: [],
        autoSort: true
      });

      await expect(loadConfig()).rejects.toThrow(
        'Duplicate locales found in supportedLocales: en'
      );
    });

    it('should load valid config with default values', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales',
        defaultLocale: 'en',
        supportedLocales: ['en', 'de'],
        keyStyle: 'nested',
        usagePatterns: [],
        autoSort: true
      });

      const config = await loadConfig();

      expect(config).toMatchObject({
        localesPath: './locales',
        defaultLocale: 'en',
        supportedLocales: ['en', 'de'],
        keyStyle: 'nested',
        usagePatterns: [],
        autoSort: true,
        compiledUsagePatterns: []
      });
    });

    it('should apply default keyStyle when not specified', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales',
        defaultLocale: 'en',
        supportedLocales: ['en'],
        usagePatterns: [],
        autoSort: true
        // keyStyle not specified
      });

      const config = await loadConfig();
      expect(config.keyStyle).toBe('nested');
    });

    it('should apply default autoSort when not specified', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales',
        defaultLocale: 'en',
        supportedLocales: ['en'],
        keyStyle: 'nested',
        usagePatterns: []
        // autoSort not specified
      });

      const config = await loadConfig();
      expect(config.autoSort).toBe(true);
    });

    it('should apply default usagePatterns when not specified', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales',
        defaultLocale: 'en',
        supportedLocales: ['en'],
        keyStyle: 'nested',
        autoSort: true
        // usagePatterns not specified
      });

      const config = await loadConfig();
      expect(config.usagePatterns).toEqual([]);
    });

    it('should compile usage patterns into regex', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue({
        localesPath: './locales',
        defaultLocale: 'en',
        supportedLocales: ['en'],
        keyStyle: 'nested',
        usagePatterns: ['t\\([\'"](.+?)[\'"]\\)'],
        autoSort: true
      });

      const config = await loadConfig();
      expect(config.compiledUsagePatterns).toHaveLength(1);
      expect(config.compiledUsagePatterns[0]).toBeInstanceOf(RegExp);
    });
  });

  describe('compileUsagePatterns', () => {
    it('should return empty array for empty patterns', () => {
      const result = compileUsagePatterns([]);
      expect(result).toEqual([]);
    });

    it('should compile valid regex patterns', () => {
      const patterns = ['t\\([\'"](.+?)[\'"]\\)', 'i18n\\.t\\([\'"](.+?)[\'"]\\)'];
      const result = compileUsagePatterns(patterns);

      expect(result).toHaveLength(2);
      result.forEach(regex => expect(regex).toBeInstanceOf(RegExp));
    });

    it('should throw error for invalid regex pattern', () => {
      const patterns = ['[invalid'];
      
      expect(() => compileUsagePatterns(patterns)).toThrow(
        'Invalid regex in usagePatterns[0]'
      );
    });

    it('should throw error when pattern has no capturing group', () => {
      const patterns = ['t\\([\'"]test[\'"]\\)'];
      
      expect(() => compileUsagePatterns(patterns)).toThrow(
        'usagePatterns[0] must include a capturing group'
      );
    });

    it('should accept named capturing groups', () => {
      const patterns = ['t\\([\'"](?<key>.+?)[\'"]\\)'];
      const result = compileUsagePatterns(patterns);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RegExp);
    });

    it('should accept standard capturing groups', () => {
      const patterns = ['t\\([\'"](.+?)[\'"]\\)'];
      const result = compileUsagePatterns(patterns);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RegExp);
    });

    it('should throw error for non-capturing groups', () => {
      const patterns = ['t\\([\'"](?:.+?)[\'"]\\)'];
      
      expect(() => compileUsagePatterns(patterns)).toThrow(
        'usagePatterns[0] must include a capturing group'
      );
    });

    it('should throw error for lookahead groups', () => {
      const patterns = ['t\\([\'"](?=test)[\'"]\\)'];
      
      expect(() => compileUsagePatterns(patterns)).toThrow(
        'usagePatterns[0] must include a capturing group'
      );
    });

    it('should throw error for lookbehind groups', () => {
      const patterns: string[] = ['t\\([\'"](?<=test)[\'"]\\)'];
      
      expect(() => compileUsagePatterns(patterns)).toThrow(
        'usagePatterns[0] must include a capturing group'
      );
    });

    it('should compile patterns with special characters', () => {
      // Pattern to match t('key') or t("key")
      const patterns = ["t\\(['\"](.+?)['\"]\\)"];
      const result = compileUsagePatterns(patterns);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RegExp);
      
      // Test the regex with global flag behavior
      const testString = "t('hello.world')";
      result[0]!.lastIndex = 0;
      const match = result[0]!.exec(testString);
      expect(match).toBeTruthy();
      expect(match![1]).toBe('hello.world');
    });
  });
});
