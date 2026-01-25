import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import type { IJob, JobResult } from "./IJob";

/**
 * Job de Books to Scrape para Queue
 */
export class BookJob implements IJob {
  name = "book-scrape";

  constructor(
    private context: BrowserContext,
    private logger: Logger
  ) {}

  async execute(): Promise<JobResult> {
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
        jobName: this.name,
        success: true,
        records,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        jobName: this.name,
        success: false,
        records: [],
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
