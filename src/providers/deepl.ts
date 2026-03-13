import type {
  Translator,
  TranslationRequest,
  TranslationResult
} from "./translator.js";

export interface DeeplTranslatorOptions {
  apiKey?: string;
  apiUrl?: string;
}

export class DeeplTranslator implements Translator {
  readonly name = "deepl";
  private options: DeeplTranslatorOptions;

  constructor(options: DeeplTranslatorOptions = {}) {
    this.options = options;
  }

  async translate(_request: TranslationRequest): Promise<TranslationResult> {
    throw new Error(
      "DeepL translator is not implemented. Provide an adapter or implementation."
    );
  }
}
