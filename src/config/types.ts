export type KeyStyle = "flat" | "nested";

export interface I18nConfig {
  localesPath: string;
  defaultLocale: string;
  supportedLocales: string[];
  keyStyle: KeyStyle;
  usagePatterns: string[];
  compiledUsagePatterns: RegExp[];
  autoSort: boolean;
}
