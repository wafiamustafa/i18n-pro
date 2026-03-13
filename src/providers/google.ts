import { translate } from "@vitalets/google-translate-api";
import type {
  Translator,
  TranslationRequest,
  TranslationResult
} from "./translator.js";

export interface GoogleTranslatorOptions {
  from?: string;
  to?: string;
  host?: string;
  fetchOptions?: Record<string, unknown>;
}

export class GoogleTranslator implements Translator {
  readonly name = "google";
  private options: GoogleTranslatorOptions;

  constructor(options: GoogleTranslatorOptions = {}) {
    this.options = options;
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const { text, targetLocale, sourceLocale } = request;
    const { from, host, fetchOptions } = this.options;
    const translateOptions: {
      to: string;
      from?: string;
      host?: string;
      fetchOptions?: Record<string, unknown>;
    } = { to: targetLocale };

    if (host !== undefined) {
      translateOptions.host = host;
    }

    if (fetchOptions !== undefined) {
      translateOptions.fetchOptions = fetchOptions;
    }

    if (sourceLocale !== undefined) {
      translateOptions.from = sourceLocale;
    } else if (from !== undefined) {
      translateOptions.from = from;
    }

    const result = await translate(text, translateOptions);

    return {
      text: result.text,
      detectedSourceLocale: result.raw?.src,
      provider: this.name
    };
  }
}
