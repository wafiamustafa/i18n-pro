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
