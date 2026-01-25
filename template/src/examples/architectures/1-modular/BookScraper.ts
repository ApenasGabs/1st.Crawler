import { BaseScraper } from "./BaseScraper";
import type { RawData, Record } from "./types";

/**
 * Exemplo 2: Scraper de livros (Books to Scrape)
 */
export class BookScraper extends BaseScraper {
  async scrape(): Promise<RawData[]> {
    const page = await this.context.newPage();
    try {
      await page.goto(this.url);

      const books = await page.locator("article.product_pod").all();
      const rawData: RawData[] = [];

      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const title = (await book.locator("h3 a").getAttribute("title")) ?? "";
        const priceText =
          (await book.locator(".price_color").textContent()) ?? "";
        const price = parseFloat(priceText.replace("£", ""));

        rawData.push({
          id: `book-${i}`,
          title,
          price,
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
      source: "books-to-scrape",
      title: data.title,
      price: data.price,
      url: data.url,
      createdAt: new Date().toISOString(),
    }));
  }
}
