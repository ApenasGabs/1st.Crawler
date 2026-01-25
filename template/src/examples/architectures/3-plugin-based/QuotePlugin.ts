import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import type { IPlugin, PluginOutput } from "./IPlugin";

/**
 * Plugin de Quotes to Scrape
 */
export class QuotePlugin implements IPlugin {
  name = "QuotePlugin";
  version = "1.0.0";
  enabled = true;

  constructor(
    private context: BrowserContext,
    private logger: Logger
  ) {}

  async init(): Promise<void> {
    this.logger.info(`${this.name} inicializando...`);
  }

  async execute(): Promise<PluginOutput> {
    const startTime = Date.now();
    try {
      const page = await this.context.newPage();

      await page.goto("https://quotes.toscrape.com/");

      const quotes = await page.locator(".quote").all();
      const records: unknown[] = [];

      for (let i = 0; i < quotes.length; i++) {
        const quote = quotes[i];
        const text = (await quote.locator(".text").textContent()) ?? "";
        const author = (await quote.locator(".author").textContent()) ?? "";

        records.push({
          id: `quote-${i}`,
          source: "quotes-to-scrape",
          title: text.trim(),
          author: author.trim(),
        });
      }

      await page.close();

      return {
        pluginName: this.name,
        records,
        duration: Date.now() - startTime,
        success: true,
      };
    } catch (error) {
      return {
        pluginName: this.name,
        records: [],
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async destroy(): Promise<void> {
    this.logger.info(`${this.name} destruindo...`);
  }
}
