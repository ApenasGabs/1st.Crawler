import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import { BaseScraper } from "./BaseScraper";
import type { RawData, Record } from "./types";

/**
 * Exemplo 1: Scraper de citações (Quotes to Scrape)
 */
export class QuoteScraper extends BaseScraper {
  async scrape(): Promise<RawData[]> {
    const page = await this.context.newPage();
    try {
      await page.goto(this.url);

      const quotes = await page.locator(".quote").all();
      const rawData: RawData[] = [];

      for (let i = 0; i < quotes.length; i++) {
        const quote = quotes[i];
        const text = (await quote.locator(".text").textContent()) ?? "";
        const author = (await quote.locator(".author").textContent()) ?? "";

        rawData.push({
          id: `quote-${i}`,
          title: text.trim(),
          url: this.url,
        });
      }

      return rawData;
    } finally {
      await page.close();
    }
  }

  map(rawData: RawData[]): Record[] {
    return rawData.map((data) => ({
      id: data.id,
      source: "quotes-to-scrape",
      title: data.title,
      url: data.url,
      createdAt: new Date().toISOString(),
    }));
  }
}
