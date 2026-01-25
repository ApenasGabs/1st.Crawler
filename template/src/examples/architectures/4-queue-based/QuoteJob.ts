import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import type { IJob, JobResult } from "./IJob";

/**
 * Job de Quotes to Scrape para Queue
 */
export class QuoteJob implements IJob {
  name = "quote-scrape";

  constructor(
    private context: BrowserContext,
    private logger: Logger
  ) {}

  async execute(): Promise<JobResult> {
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
          text: text.trim(),
          author: author.trim(),
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
