import type * as cheerio from "cheerio";
import type { RawData, ScrapedRecord } from "../../domain/types";
import { BaseHttpScraper } from "../base/BaseHttpScraper";

/**
 * Exemplo de scraper SSR usando fetch + cheerio.
 * Extrai citações de https://quotes.toscrape.com (site SSR público de treino).
 */
export class SiteCScraper extends BaseHttpScraper<RawData> {
  name = "siteC-ssr";
  baseUrl = "https://quotes.toscrape.com/";

  protected scrape = async ($: cheerio.CheerioAPI): Promise<RawData[]> => {
    const items: RawData[] = [];

    $(".quote").each((_i, el) => {
      const text = $(el).find(".text").text().trim();
      const author = $(el).find(".author").text().trim();
      items.push({
        id: `quote-${_i}`,
        title: text,
        description: author,
        url: this.baseUrl,
      });
    });

    return items;
  };

  protected map = async (raw: RawData[]): Promise<ScrapedRecord[]> =>
    raw.map((r) => ({
      id: r.id,
      source: this.name,
      title: r.title,
      description: r.description,
      url: r.url,
    }));

  protected validate = async (
    data: ScrapedRecord[],
  ): Promise<ScrapedRecord[]> => data;
}
