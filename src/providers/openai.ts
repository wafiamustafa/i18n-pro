import OpenAI from "openai";
import type {
  Translator,
  TranslationRequest,
  TranslationResult,
  OpenAITranslatorOptions,
} from "./translator.js";

export class OpenAITranslator implements Translator {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(options: OpenAITranslatorOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenAI API key is required. Provide it via the 'apiKey' constructor option or set the OPENAI_API_KEY environment variable."
      );
    }

    this.model = options.model ?? "gpt-3.5-turbo";
    this.client = new OpenAI({
      apiKey,
      ...(options.baseUrl ? { baseURL: options.baseUrl } : {}),
    });
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const { text, targetLocale, sourceLocale, context } = request;

    const sourcePart = sourceLocale
      ? ` from ${sourceLocale}`
      : "";

    const systemMessage = `You are a professional translator. Translate the given text${sourcePart} to ${targetLocale}. Return ONLY the translated text, nothing else. Do not add quotes, explanations, or any extra formatting.`;

    const userMessage = context
      ? `Context: ${context}\n\n${text}`
      : text;

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim() ?? "";

    return {
      text: content,
      provider: this.name,
    };
  }
}
