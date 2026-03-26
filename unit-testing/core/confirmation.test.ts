import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import inquirer from 'inquirer';
import { confirmAction } from '../../src/core/confirmation.js';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}));

describe('confirmation', () => {
  const originalIsTTY = process.stdout.isTTY;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      writable: true,
      configurable: true
    });
  });

  describe('confirmAction', () => {
    it('should return true when skip option is true', async () => {
      const result = await confirmAction('Are you sure?', { skip: true });
      expect(result).toBe(true);
      expect(inquirer.prompt).not.toHaveBeenCalled();
    });

    it('should throw error in CI mode without yes flag', async () => {
      await expect(confirmAction('Are you sure?', { ci: true })).rejects.toThrow(
        'Confirmation required in CI mode. Re-run with --yes to proceed.'
      );
    });

    it('should return true in CI mode with skip true', async () => {
      const result = await confirmAction('Are you sure?', { ci: true, skip: true });
      expect(result).toBe(true);
    });

    it('should return default value in non-TTY environment', async () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const result = await confirmAction('Are you sure?', { defaultValue: true });
      expect(result).toBe(true);
      expect(inquirer.prompt).not.toHaveBeenCalled();
    });

    it('should return false as default in non-TTY environment', async () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });

      const result = await confirmAction('Are you sure?');
      expect(result).toBe(false);
    });

    it('should prompt user in TTY environment', async () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        writable: true,
        configurable: true
      });

      vi.mocked(inquirer.prompt).mockResolvedValue({ confirmed: true });

      const result = await confirmAction('Are you sure?');
      expect(result).toBe(true);
      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Are you sure?',
          default: false
        }
      ]);
    });

    it('should use provided default value in prompt', async () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        writable: true,
        configurable: true
      });

      vi.mocked(inquirer.prompt).mockResolvedValue({ confirmed: false });

      await confirmAction('Are you sure?', { defaultValue: true });
      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Are you sure?',
          default: true
        }
      ]);
    });

    it('should return false when user declines', async () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        writable: true,
        configurable: true
      });

      vi.mocked(inquirer.prompt).mockResolvedValue({ confirmed: false });

      const result = await confirmAction('Are you sure?');
      expect(result).toBe(false);
    });

    it('should handle all option combinations correctly', async () => {
      // skip: true takes precedence
      expect(await confirmAction('Test?', { skip: true, ci: true })).toBe(true);
      expect(await confirmAction('Test?', { skip: true, ci: false })).toBe(true);
      
      // ci: true without skip throws
      await expect(confirmAction('Test?', { ci: true })).rejects.toThrow();
      
      // non-TTY returns default
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true
      });
      expect(await confirmAction('Test?', { defaultValue: true })).toBe(true);
      expect(await confirmAction('Test?', { defaultValue: false })).toBe(false);
    });
  });
});
