export interface TranslationRequest {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
  context?: string;
}

export interface TranslationResult {
  text: string;
  detectedSourceLocale?: string;
  provider: string;
}

export interface Translator {
  readonly name: string;
  translate(request: TranslationRequest): Promise<TranslationResult>;
}
export interface GoogleTranslatorOptions {
  from?: string;
  to?: string;
  host?: string;
  fetchOptions?: Record<string, unknown>;
}

export interface OpenAITranslatorOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface AIProvider {
  translate(
    text: string,
    from: string,
    to: string,
    context?: string
  ): Promise<string>;

  suggestKey(
    text: string,
    namespace?: string
  ): Promise<string>;
}
