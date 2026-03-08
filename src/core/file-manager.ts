import fs from "fs-extra";
import path from "path";
import type { I18nConfig } from "../config/types.js";

export class FileManager {
  private localesPath: string;
  private config: I18nConfig;

  constructor(config: I18nConfig) {
    this.config = config;
    this.localesPath = path.resolve(process.cwd(), config.localesPath);
  }

  getLocaleFilePath(locale: string): string {
    return path.join(this.localesPath, `${locale}.json`);
  }

  async ensureLocalesDirectory(): Promise<void> {
    await fs.ensureDir(this.localesPath);
  }

  async localeExists(locale: string): Promise<boolean> {
    const filePath = this.getLocaleFilePath(locale);
    return fs.pathExists(filePath);
  }

  async listLocales(): Promise<string[]> {
    return this.config.supportedLocales;
  }

    async readLocale(locale: string): Promise<Record<string, any>> {
    const filePath = this.getLocaleFilePath(locale);

    if (!(await fs.pathExists(filePath))) {
      throw new Error(`Locale file "${locale}.json" does not exist.`);
    }

    try {
      return await fs.readJson(filePath);
    } catch {
      throw new Error(`Invalid JSON in "${locale}.json".`);
    }
  }

    async writeLocale(
    locale: string,
    data: Record<string, any>,
    options?: { dryRun?: boolean }
  ): Promise<void> {
    const filePath = this.getLocaleFilePath(locale);

    const finalData = this.config.autoSort
      ? this.sortKeysRecursively(data)
      : data;

    if (options?.dryRun) {
      return;
    }

    await fs.writeJson(filePath, finalData, { spaces: 2 });
  }

    async deleteLocale(
    locale: string,
    options?: { dryRun?: boolean }
  ): Promise<void> {
    const filePath = this.getLocaleFilePath(locale);

    if (!(await fs.pathExists(filePath))) {
      throw new Error(`Locale "${locale}" does not exist.`);
    }

    if (options?.dryRun) {
      return;
    }

    await fs.remove(filePath);
  }

    async createLocale(
    locale: string,
    initialData: Record<string, any>,
    options?: { dryRun?: boolean }
  ): Promise<void> {
    await this.ensureLocalesDirectory();

    const filePath = this.getLocaleFilePath(locale);

    if (await fs.pathExists(filePath)) {
      throw new Error(`Locale "${locale}" already exists.`);
    }

    if (options?.dryRun) {
      return;
    }

    await fs.writeJson(filePath, initialData, { spaces: 2 });
  }

    private sortKeysRecursively(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortKeysRecursively(item));
    }

    if (obj !== null && typeof obj === "object") {
      return Object.keys(obj)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = this.sortKeysRecursively(obj[key]);
          return acc;
        }, Object.create(null));
    }

    return obj;
  }
  
}
