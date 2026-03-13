import type {
  Translator,
  TranslationRequest,
  TranslationResult
} from "./translator.js";

export interface OpenAITranslatorOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export class OpenAITranslator implements Translator {
  readonly name = "openai";
  private options: OpenAITranslatorOptions;

  constructor(options: OpenAITranslatorOptions = {}) {
    this.options = options;
  }

  async translate(_request: TranslationRequest): Promise<TranslationResult> {
    throw new Error(
      "OpenAI translator is not implemented. Provide an adapter or implementation."
    );
  }
}
