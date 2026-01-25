import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import type { IPlugin, PluginOutput } from "./IPlugin";

/**
 * Plugin de Books to Scrape
 */
export class BookPlugin implements IPlugin {
  name = "BookPlugin";
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

      await page.goto("https://books.toscrape.com/");

      const books = await page.locator("article.product_pod").all();
      const records: unknown[] = [];

      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const title = (await book.locator("h3 a").getAttribute("title")) ?? "";
        const priceText =
          (await book.locator(".price_color").textContent()) ?? "";

        records.push({
          id: `book-${i}`,
          source: "books-to-scrape",
          title,
          price: priceText,
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
