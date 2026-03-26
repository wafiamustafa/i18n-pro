import { describe, it, expect, vi } from 'vitest';
import { TranslationService } from '../../src/services/translation-service.js';
import type { Translator, TranslationRequest, TranslationResult } from '../../src/providers/translator.js';

// Create a mock translator
const createMockTranslator = (name: string): Translator => ({
  name,
  translate: vi.fn()
});

describe('TranslationService', () => {
  describe('constructor', () => {
    it('should create instance with translator', () => {
      const mockTranslator = createMockTranslator('mock');
      const service = new TranslationService(mockTranslator);
      expect(service).toBeInstanceOf(TranslationService);
    });
  });

  describe('translate', () => {
    it('should call translator with request', async () => {
      const mockTranslator = createMockTranslator('mock');
      const mockResult: TranslationResult = {
        text: 'translated',
        provider: 'mock'
      };
      vi.mocked(mockTranslator.translate).mockResolvedValue(mockResult);

      const service = new TranslationService(mockTranslator);
      const request: TranslationRequest = {
        text: 'hello',
        targetLocale: 'es',
        sourceLocale: 'en'
      };

      const result = await service.translate(request);

      expect(mockTranslator.translate).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResult);
    });

    it('should pass through all request fields', async () => {
      const mockTranslator = createMockTranslator('mock');
      vi.mocked(mockTranslator.translate).mockResolvedValue({
        text: 'translated',
        provider: 'mock'
      });

      const service = new TranslationService(mockTranslator);
      const request: TranslationRequest = {
        text: 'hello',
        targetLocale: 'fr',
        sourceLocale: 'en',
        context: 'greeting'
      };

      await service.translate(request);

      expect(mockTranslator.translate).toHaveBeenCalledWith({
        text: 'hello',
        targetLocale: 'fr',
        sourceLocale: 'en',
        context: 'greeting'
      });
    });

    it('should handle minimal request', async () => {
      const mockTranslator = createMockTranslator('mock');
      vi.mocked(mockTranslator.translate).mockResolvedValue({
        text: 'translated',
        provider: 'mock'
      });

      const service = new TranslationService(mockTranslator);
      const request: TranslationRequest = {
        text: 'hello',
        targetLocale: 'es'
      };

      const result = await service.translate(request);

      expect(result.text).toBe('translated');
    });

    it('should propagate errors from translator', async () => {
      const mockTranslator = createMockTranslator('mock');
      vi.mocked(mockTranslator.translate).mockRejectedValue(new Error('Translation failed'));

      const service = new TranslationService(mockTranslator);
      const request: TranslationRequest = {
        text: 'hello',
        targetLocale: 'es'
      };

      await expect(service.translate(request)).rejects.toThrow('Translation failed');
    });

    it('should return detected source locale when provided', async () => {
      const mockTranslator = createMockTranslator('mock');
      vi.mocked(mockTranslator.translate).mockResolvedValue({
        text: 'Hola',
        detectedSourceLocale: 'en',
        provider: 'mock'
      });

      const service = new TranslationService(mockTranslator);
      const request: TranslationRequest = {
        text: 'hello',
        targetLocale: 'es'
      };

      const result = await service.translate(request);

      expect(result.detectedSourceLocale).toBe('en');
    });

    it('should work with different translator implementations', async () => {
      // Test with Google-like translator
      const googleTranslator = createMockTranslator('google');
      vi.mocked(googleTranslator.translate).mockResolvedValue({
        text: 'Hola',
        detectedSourceLocale: 'en',
        provider: 'google'
      });

      const googleService = new TranslationService(googleTranslator);
      const googleResult = await googleService.translate({
        text: 'Hello',
        targetLocale: 'es'
      });

      expect(googleResult.provider).toBe('google');

      // Test with DeepL-like translator
      const deeplTranslator = createMockTranslator('deepl');
      vi.mocked(deeplTranslator.translate).mockResolvedValue({
        text: 'Bonjour',
        provider: 'deepl'
      });

      const deeplService = new TranslationService(deeplTranslator);
      const deeplResult = await deeplService.translate({
        text: 'Hello',
        targetLocale: 'fr'
      });

      expect(deeplResult.provider).toBe('deepl');
    });

    it('should handle empty text', async () => {
      const mockTranslator = createMockTranslator('mock');
      vi.mocked(mockTranslator.translate).mockResolvedValue({
        text: '',
        provider: 'mock'
      });

      const service = new TranslationService(mockTranslator);
      const request: TranslationRequest = {
        text: '',
        targetLocale: 'es'
      };

      const result = await service.translate(request);
      expect(result.text).toBe('');
    });

    it('should handle long text', async () => {
      const mockTranslator = createMockTranslator('mock');
      const longText = 'a'.repeat(10000);
      vi.mocked(mockTranslator.translate).mockResolvedValue({
        text: 'translated long text',
        provider: 'mock'
      });

      const service = new TranslationService(mockTranslator);
      const request: TranslationRequest = {
        text: longText,
        targetLocale: 'es'
      };

      const result = await service.translate(request);
      expect(result.text).toBe('translated long text');
    });
  });
});
