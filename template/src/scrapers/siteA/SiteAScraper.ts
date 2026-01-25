import type { Page } from "playwright";
import type { Imovel, RawData } from "../../domain/types";
import { BaseScraper } from "../base/BaseScraper";

export class SiteAScraper extends BaseScraper<RawData> {
  name = "siteA";
  baseUrl = "https://example.com/";

  protected scrape = async (page: Page): Promise<RawData[]> => {
    await page.goto(this.baseUrl);
    const items = await page.evaluate(() => {
      // Exemplo simples: coleta apenas título da página
      return [
        {
          id: "example-1",
          title: document.title,
          price: 1000,
          location: "Sao Paulo, SP",
          url: location.href,
        },
      ];
    });
    return items;
  };

  protected map = async (raw: RawData[]): Promise<Imovel[]> =>
    raw.map((r) => ({
      id: r.id,
      source: this.name,
      title: r.title,
      price: r.price,
      location: { city: "Sao Paulo", state: "SP" },
      url: r.url,
    }));

  protected validate = async (data: Imovel[]): Promise<Imovel[]> => data;
}
