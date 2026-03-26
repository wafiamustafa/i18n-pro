import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { FileManager } from '../../src/core/file-manager.js';
import type { I18nConfig } from '../../src/config/types.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readJson: vi.fn(),
    writeJson: vi.fn(),
    remove: vi.fn(),
    ensureDir: vi.fn()
  }
}));

describe('FileManager', () => {
  const mockCwd = '/mock/project';
  const mockConfig: I18nConfig = {
    localesPath: './locales',
    defaultLocale: 'en',
    supportedLocales: ['en', 'de'],
    keyStyle: 'nested',
    usagePatterns: [],
    compiledUsagePatterns: [],
    autoSort: true
  };

  let fileManager: FileManager;

  beforeEach(() => {
    vi.resetAllMocks();
    process.cwd = vi.fn().mockReturnValue(mockCwd);
    fileManager = new FileManager(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with config', () => {
      expect(fileManager).toBeInstanceOf(FileManager);
    });

    it('should resolve localesPath relative to cwd', () => {
      const resolvedPath = fileManager.getLocaleFilePath('en');
      expect(resolvedPath).toBe(path.join(mockCwd, 'locales', 'en.json'));
    });
  });

  describe('getLocaleFilePath', () => {
    it('should return correct file path for locale', () => {
      const result = fileManager.getLocaleFilePath('en');
      expect(result).toBe(path.join(mockCwd, 'locales', 'en.json'));
    });

    it('should handle locale with hyphen', () => {
      const result = fileManager.getLocaleFilePath('en-US');
      expect(result).toBe(path.join(mockCwd, 'locales', 'en-US.json'));
    });
  });

  describe('ensureLocalesDirectory', () => {
    it('should ensure locales directory exists', async () => {
      await fileManager.ensureLocalesDirectory();
      expect(fs.ensureDir).toHaveBeenCalledWith(path.join(mockCwd, 'locales'));
    });
  });

  describe('localeExists', () => {
    it('should return true when locale file exists', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      const result = await fileManager.localeExists('en');
      expect(result).toBe(true);
      expect(fs.pathExists).toHaveBeenCalledWith(path.join(mockCwd, 'locales', 'en.json'));
    });

    it('should return false when locale file does not exist', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      const result = await fileManager.localeExists('fr');
      expect(result).toBe(false);
    });
  });

  describe('listLocales', () => {
    it('should return supported locales from config', async () => {
      const result = await fileManager.listLocales();
      expect(result).toEqual(['en', 'de']);
    });
  });

  describe('readLocale', () => {
    it('should read and parse locale file', async () => {
      const mockData = { greeting: 'Hello' };
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(mockData);

      const result = await fileManager.readLocale('en');
      expect(result).toEqual(mockData);
      expect(fs.readJson).toHaveBeenCalledWith(path.join(mockCwd, 'locales', 'en.json'));
    });

    it('should throw error when locale file does not exist', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);

      await expect(fileManager.readLocale('fr')).rejects.toThrow(
        'Locale file "fr.json" does not exist.'
      );
    });

    it('should throw error when locale file has invalid JSON', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockRejectedValue(new Error('Invalid JSON'));

      await expect(fileManager.readLocale('en')).rejects.toThrow(
        'Invalid JSON in "en.json".'
      );
    });
  });

  describe('writeLocale', () => {
    it('should write locale data to file', async () => {
      const data = { greeting: 'Hello' };
      await fileManager.writeLocale('en', data);
      expect(fs.writeJson).toHaveBeenCalledWith(
        path.join(mockCwd, 'locales', 'en.json'),
        data,
        { spaces: 2 }
      );
    });

    it('should sort keys when autoSort is true', async () => {
      const data = { zebra: 'z', apple: 'a', mango: 'm' };
      await fileManager.writeLocale('en', data);
      
      const writtenData = vi.mocked(fs.writeJson).mock.calls[0]![1];
      expect(Object.keys(writtenData)).toEqual(['apple', 'mango', 'zebra']);
    });

    it('should not sort keys when autoSort is false', async () => {
      const unsortedConfig: I18nConfig = { ...mockConfig, autoSort: false };
      const unsortedFileManager = new FileManager(unsortedConfig);
      
      const data = { zebra: 'z', apple: 'a', mango: 'm' };
      await unsortedFileManager.writeLocale('en', data);
      
      const writtenData = vi.mocked(fs.writeJson).mock.calls[0]![1];
      expect(Object.keys(writtenData)).toEqual(['zebra', 'apple', 'mango']);
    });

    it('should recursively sort nested objects', async () => {
      const data = {
        z: { b: 2, a: 1 },
        a: { y: 2, x: 1 }
      };
      await fileManager.writeLocale('en', data);
      
      const writtenData = vi.mocked(fs.writeJson).mock.calls[0]![1];
      expect(writtenData).toEqual({
        a: { x: 1, y: 2 },
        z: { a: 1, b: 2 }
      });
    });

    it('should handle arrays without sorting', async () => {
      const data = {
        items: [3, 1, 2],
        sorted: 'yes'
      };
      await fileManager.writeLocale('en', data);
      
      const writtenData = vi.mocked(fs.writeJson).mock.calls[0]![1];
      expect(writtenData.items).toEqual([3, 1, 2]);
    });

    it('should not write file in dry run mode', async () => {
      const data = { greeting: 'Hello' };
      await fileManager.writeLocale('en', data, { dryRun: true });
      expect(fs.writeJson).not.toHaveBeenCalled();
    });
  });

  describe('deleteLocale', () => {
    it('should delete locale file', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      await fileManager.deleteLocale('de');
      expect(fs.remove).toHaveBeenCalledWith(path.join(mockCwd, 'locales', 'de.json'));
    });

    it('should throw error when locale file does not exist', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);

      await expect(fileManager.deleteLocale('fr')).rejects.toThrow(
        'Locale "fr" does not exist.'
      );
    });

    it('should not delete file in dry run mode', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);
      await fileManager.deleteLocale('de', { dryRun: true });
      expect(fs.remove).not.toHaveBeenCalled();
    });
  });

  describe('createLocale', () => {
    it('should create new locale file', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      const initialData = { greeting: 'Hello' };
      
      await fileManager.createLocale('fr', initialData);
      
      expect(fs.ensureDir).toHaveBeenCalledWith(path.join(mockCwd, 'locales'));
      expect(fs.writeJson).toHaveBeenCalledWith(
        path.join(mockCwd, 'locales', 'fr.json'),
        initialData,
        { spaces: 2 }
      );
    });

    it('should throw error when locale already exists', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(true);

      await expect(fileManager.createLocale('en', {})).rejects.toThrow(
        'Locale "en" already exists.'
      );
    });

    it('should not create file in dry run mode', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      await fileManager.createLocale('fr', {}, { dryRun: true });
      expect(fs.writeJson).not.toHaveBeenCalled();
    });

    it('should ensure directory before creating file', async () => {
      (vi.mocked(fs.pathExists) as any).mockResolvedValue(false);
      await fileManager.createLocale('fr', {});
      
      // ensureDir should be called before writeJson
      const ensureDirCall = vi.mocked(fs.ensureDir).mock.invocationCallOrder[0];
      const writeJsonCall = vi.mocked(fs.writeJson).mock.invocationCallOrder[0];
      expect(ensureDirCall).toBeLessThan(writeJsonCall);
    });
  });

  describe('sortKeysRecursively (private method)', () => {
    it('should be applied through writeLocale', async () => {
      const data = {
        zebra: {
          zebraNested: 'z',
          appleNested: 'a'
        },
        apple: 'a'
      };
      await fileManager.writeLocale('en', data);
      
      const writtenData = vi.mocked(fs.writeJson).mock.calls[0]![1];
      expect(writtenData).toEqual({
        apple: 'a',
        zebra: {
          appleNested: 'a',
          zebraNested: 'z'
        }
      });
    });

    it('should handle null values', async () => {
      const data = {
        z: null,
        a: 'value'
      };
      await fileManager.writeLocale('en', data);
      
      const writtenData = vi.mocked(fs.writeJson).mock.calls[0]![1];
      expect(writtenData).toEqual({
        a: 'value',
        z: null
      });
    });

    it('should handle nested arrays', async () => {
      const data = {
        z: [3, 1, 2],
        a: { nested: [2, 1] }
      };
      await fileManager.writeLocale('en', data);
      
      const writtenData = vi.mocked(fs.writeJson).mock.calls[0]![1];
      expect(writtenData).toEqual({
        a: { nested: [2, 1] },
        z: [3, 1, 2]
      });
    });
  });
});
