import type { Page } from "playwright";
import type { Imovel, RawData } from "../../domain/types";
import { BaseScraper } from "../base/BaseScraper";

export class SiteBScraper extends BaseScraper<RawData> {
  name = "siteB";
  baseUrl = "https://example.org/";

  protected scrape = async (page: Page): Promise<RawData[]> => {
    await page.goto(this.baseUrl);
    return [
      {
        id: "example-b-1",
        title: await page.title(),
        price: 1200,
        location: "Rio de Janeiro, RJ",
        url: this.baseUrl,
      },
    ];
  };

  protected map = async (raw: RawData[]): Promise<Imovel[]> =>
    raw.map((r) => ({
      id: r.id,
      source: this.name,
      title: r.title,
      price: r.price,
      location: { city: "Rio de Janeiro", state: "RJ" },
      url: r.url,
    }));

  protected validate = async (data: Imovel[]): Promise<Imovel[]> => data;
}
