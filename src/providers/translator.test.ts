import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleTranslator } from './google.js';
import { DeeplTranslator } from './deepl.js';
import { OpenAITranslator } from './openai.js';
import type { TranslationRequest } from './translator.js';

// Mock the google translate API
vi.mock('@vitalets/google-translate-api', () => ({
  translate: vi.fn()
}));

import { translate } from '@vitalets/google-translate-api';

describe('Translator Providers', () => {
  describe('GoogleTranslator', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should have correct name', () => {
      const translator = new GoogleTranslator();
      expect(translator.name).toBe('google');
    });

    it('should translate text with source locale', async () => {
      const mockResult = {
        text: 'Hola mundo',
        raw: { src: 'en' }
      };
      vi.mocked(translate).mockResolvedValue(mockResult);

      const translator = new GoogleTranslator();
      const request: TranslationRequest = {
        text: 'Hello world',
        targetLocale: 'es',
        sourceLocale: 'en'
      };

      const result = await translator.translate(request);

      expect(translate).toHaveBeenCalledWith('Hello world', {
        to: 'es',
        from: 'en'
      });
      expect(result).toEqual({
        text: 'Hola mundo',
        detectedSourceLocale: 'en',
        provider: 'google'
      });
    });

    it('should translate text without source locale (auto-detect)', async () => {
      const mockResult = {
        text: 'Hola mundo',
        raw: { src: 'en' }
      };
      vi.mocked(translate).mockResolvedValue(mockResult);

      const translator = new GoogleTranslator();
      const request: TranslationRequest = {
        text: 'Hello world',
        targetLocale: 'es'
      };

      const result = await translator.translate(request);

      expect(translate).toHaveBeenCalledWith('Hello world', {
        to: 'es'
      });
      expect(result.text).toBe('Hola mundo');
    });

    it('should use default options when provided', async () => {
      const mockResult = {
        text: 'Hola mundo',
        raw: { src: 'en' }
      };
      vi.mocked(translate).mockResolvedValue(mockResult);

      const translator = new GoogleTranslator({
        from: 'en',
        host: 'translate.google.com',
        fetchOptions: { headers: { 'User-Agent': 'test' } }
      });

      const request: TranslationRequest = {
        text: 'Hello world',
        targetLocale: 'es'
      };

      await translator.translate(request);

      expect(translate).toHaveBeenCalledWith('Hello world', {
        to: 'es',
        from: 'en',
        host: 'translate.google.com',
        fetchOptions: { headers: { 'User-Agent': 'test' } }
      });
    });

    it('should override default from with request sourceLocale', async () => {
      const mockResult = {
        text: 'Bonjour',
        raw: { src: 'fr' }
      };
      vi.mocked(translate).mockResolvedValue(mockResult);

      const translator = new GoogleTranslator({ from: 'en' });

      const request: TranslationRequest = {
        text: 'Hello',
        targetLocale: 'de',
        sourceLocale: 'fr'
      };

      await translator.translate(request);

      expect(translate).toHaveBeenCalledWith('Hello', {
        to: 'de',
        from: 'fr'
      });
    });

    it('should handle translation with context', async () => {
      const mockResult = {
        text: 'Bank (financial)',
        raw: { src: 'en' }
      };
      vi.mocked(translate).mockResolvedValue(mockResult);

      const translator = new GoogleTranslator();
      const request: TranslationRequest = {
        text: 'Bank',
        targetLocale: 'es',
        context: 'financial institution'
      };

      const result = await translator.translate(request);
      expect(result.text).toBe('Bank (financial)');
    });

    it('should handle API errors', async () => {
      vi.mocked(translate).mockRejectedValue(new Error('API Error'));

      const translator = new GoogleTranslator();
      const request: TranslationRequest = {
        text: 'Hello',
        targetLocale: 'es'
      };

      await expect(translator.translate(request)).rejects.toThrow('API Error');
    });

    it('should handle result without raw data', async () => {
      const mockResult = {
        text: 'Hola'
        // no raw property
      };
      vi.mocked(translate).mockResolvedValue(mockResult);

      const translator = new GoogleTranslator();
      const request: TranslationRequest = {
        text: 'Hello',
        targetLocale: 'es'
      };

      const result = await translator.translate(request);
      expect(result.detectedSourceLocale).toBeUndefined();
    });
  });

  describe('DeeplTranslator', () => {
    it('should have correct name', () => {
      const translator = new DeeplTranslator();
      expect(translator.name).toBe('deepl');
    });

    it('should throw not implemented error', async () => {
      const translator = new DeeplTranslator();
      const request: TranslationRequest = {
        text: 'Hello',
        targetLocale: 'es'
      };

      await expect(translator.translate(request)).rejects.toThrow(
        'DeepL translator is not implemented. Provide an adapter or implementation.'
      );
    });

    it('should accept options in constructor', () => {
      const translator = new DeeplTranslator({
        apiKey: 'test-key',
        apiUrl: 'https://api.deepl.com'
      });
      expect(translator.name).toBe('deepl');
    });

    it('should work with empty options', () => {
      const translator = new DeeplTranslator();
      expect(translator.name).toBe('deepl');
    });
  });

  describe('OpenAITranslator', () => {
    it('should have correct name', () => {
      const translator = new OpenAITranslator();
      expect(translator.name).toBe('openai');
    });

    it('should throw not implemented error', async () => {
      const translator = new OpenAITranslator();
      const request: TranslationRequest = {
        text: 'Hello',
        targetLocale: 'es'
      };

      await expect(translator.translate(request)).rejects.toThrow(
        'OpenAI translator is not implemented. Provide an adapter or implementation.'
      );
    });

    it('should accept options in constructor', () => {
      const translator = new OpenAITranslator({
        apiKey: 'test-key',
        model: 'gpt-4',
        baseUrl: 'https://api.openai.com'
      });
      expect(translator.name).toBe('openai');
    });

    it('should work with empty options', () => {
      const translator = new OpenAITranslator();
      expect(translator.name).toBe('openai');
    });
  });
});
