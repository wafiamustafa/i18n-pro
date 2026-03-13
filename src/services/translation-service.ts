import type {
  Translator,
  TranslationRequest,
  TranslationResult
} from "../providers/translator.js";

export class TranslationService {
  private translator: Translator;

  constructor(translator: Translator) {
    this.translator = translator;
  }

  translate(request: TranslationRequest): Promise<TranslationResult> {
    return this.translator.translate(request);
  }
}
