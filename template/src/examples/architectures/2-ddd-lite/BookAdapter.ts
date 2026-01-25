import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import type { IDataAdapter, ContentRecord } from "./types";

/**
 * Adapter para Books to Scrape
 * Implementa IDataAdapter
 */
export class BookAdapter implements IDataAdapter {
  name = "BookAdapter";
  source = "books-to-scrape";

  constructor(
    private context: BrowserContext,
    private logger: Logger
  ) {}

  async fetch(): Promise<unknown[]> {
    const page = await this.context.newPage();
    try {
      await page.goto("https://books.toscrape.com/");

      const books = await page.locator("article.product_pod").all();
      const data: unknown[] = [];

      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const title = (await book.locator("h3 a").getAttribute("title")) ?? "";
        const priceText =
          (await book.locator(".price_color").textContent()) ?? "";

        data.push({
          title,
          price: priceText,
        });
      }

      return data;
    } finally {
      await page.close();
    }
  }

  transform(raw: unknown[]): ContentRecord[] {
    return (raw as Array<{ title: string; price: string }>).map(
      (item, idx) => ({
        id: `book-${idx}`,
        source: this.source,
        title: item.title,
        description: `Preço: ${item.price}`,
        externalUrl: "https://books.toscrape.com/",
        createdAt: new Date().toISOString(),
      })
    );
  }

  validate(records: ContentRecord[]): boolean {
    return records.length > 0;
  }
}
