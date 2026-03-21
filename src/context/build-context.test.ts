import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildContext } from './build-context.js';
import { loadConfig } from '../config/config-loader.js';
import { FileManager } from '../core/file-manager.js';
import type { I18nConfig } from '../config/types.js';
import type { GlobalOptions } from './types.js';

// Mock dependencies
vi.mock('../config/config-loader.js', () => ({
  loadConfig: vi.fn()
}));

vi.mock('../core/file-manager.js', () => ({
  FileManager: vi.fn().mockImplementation(() => ({
    // Mock FileManager instance
  }))
}));

describe('buildContext', () => {
  const mockConfig: I18nConfig = {
    localesPath: './locales',
    defaultLocale: 'en',
    supportedLocales: ['en', 'de'],
    keyStyle: 'nested',
    usagePatterns: [],
    compiledUsagePatterns: [],
    autoSort: true
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(loadConfig).mockResolvedValue(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should build context with default options', async () => {
    const options: GlobalOptions = {};
    
    const context = await buildContext(options);

    expect(loadConfig).toHaveBeenCalled();
    expect(FileManager).toHaveBeenCalledWith(mockConfig);
    expect(context).toMatchObject({
      config: mockConfig,
      options: {}
    });
    expect(context.fileManager).toBeDefined();
  });

  it('should build context with all options', async () => {
    const options: GlobalOptions = {
      yes: true,
      dryRun: true,
      ci: true,
      force: true
    };
    
    const context = await buildContext(options);

    expect(context.options).toEqual({
      yes: true,
      dryRun: true,
      ci: true,
      force: true
    });
  });

  it('should propagate config loading errors', async () => {
    vi.mocked(loadConfig).mockRejectedValue(new Error('Config not found'));

    const options: GlobalOptions = {};
    
    await expect(buildContext(options)).rejects.toThrow('Config not found');
  });

  it('should pass config to FileManager', async () => {
    const customConfig: I18nConfig = {
      ...mockConfig,
      localesPath: './custom-locales',
      defaultLocale: 'fr'
    };
    vi.mocked(loadConfig).mockResolvedValue(customConfig);

    await buildContext({});

    expect(FileManager).toHaveBeenCalledWith(customConfig);
  });

  it('should create FileManager with correct config', async () => {
    await buildContext({});

    const fileManagerCall = vi.mocked(FileManager).mock.calls[0]!;
    expect(fileManagerCall[0]).toBe(mockConfig);
  });

  it('should handle partial options', async () => {
    const options: GlobalOptions = {
      yes: true
      // dryRun, ci, force not specified
    };
    
    const context = await buildContext(options);

    expect(context.options.yes).toBe(true);
    expect(context.options.dryRun).toBeUndefined();
    expect(context.options.ci).toBeUndefined();
    expect(context.options.force).toBeUndefined();
  });

  it('should return context with correct structure', async () => {
    const options: GlobalOptions = { dryRun: true };
    
    const context = await buildContext(options);

    expect(context).toHaveProperty('config');
    expect(context).toHaveProperty('fileManager');
    expect(context).toHaveProperty('options');
    
    expect(context.config).toEqual(mockConfig);
    expect(context.options).toEqual({ dryRun: true });
  });

  it('should handle empty options object', async () => {
    const context = await buildContext({});

    expect(context.config).toEqual(mockConfig);
    expect(context.options).toEqual({});
  });

  it('should create new FileManager instance for each call', async () => {
    await buildContext({});
    await buildContext({});

    expect(FileManager).toHaveBeenCalledTimes(2);
  });

  it('should load config once per call', async () => {
    await buildContext({});

    expect(loadConfig).toHaveBeenCalledTimes(1);
  });
});
