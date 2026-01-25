import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import type { IDataAdapter, ContentRecord } from "./types";

/**
 * Adapter para Quotes to Scrape
 * Implementa IDataAdapter
 */
export class QuoteAdapter implements IDataAdapter {
  name = "QuoteAdapter";
  source = "quotes-to-scrape";

  constructor(
    private context: BrowserContext,
    private logger: Logger,
  ) {}

  async fetch(): Promise<unknown[]> {
    const page = await this.context.newPage();
    try {
      await page.goto("https://quotes.toscrape.com/");

      const quotes = await page.locator(".quote").all();
      const data: unknown[] = [];

      for (let i = 0; i < quotes.length; i++) {
        const quote = quotes[i];
        const text = (await quote.locator(".text").textContent()) ?? "";
        const author = (await quote.locator(".author").textContent()) ?? "";

        data.push({ text: text.trim(), author: author.trim() });
      }

      return data;
    } finally {
      await page.close();
    }
  }

  transform(raw: unknown[]): ContentRecord[] {
    return (raw as Array<{ text: string; author: string }>).map(
      (item, idx) => ({
        id: `quote-${idx}`,
        source: this.source,
        title: item.text,
        description: item.author,
        externalUrl: "https://quotes.toscrape.com/",
        createdAt: new Date().toISOString(),
      }),
    );
  }

  validate(records: ContentRecord[]): boolean {
    return records.length > 0;
  }
}
