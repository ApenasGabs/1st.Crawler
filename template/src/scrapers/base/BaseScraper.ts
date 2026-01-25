import type { BrowserContext, Page } from "playwright";
import type { Imovel, RawData } from "../../domain/types";
import { logger } from "../../utils/logger";

export interface ScraperConfig {
  userAgent: string;
  maxDurationMs: number;
}

export abstract class BaseScraper<T extends RawData = RawData> {
  abstract name: string;
  abstract baseUrl: string;

  constructor(protected readonly config: ScraperConfig) {}

  protected setup = async (page: Page): Promise<void> => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.setExtraHTTPHeaders({ "User-Agent": this.config.userAgent });
  };

  protected abstract scrape(page: Page): Promise<T[]>;
  protected abstract map(raw: T[]): Promise<Imovel[]>;
  protected abstract validate(data: Imovel[]): Promise<Imovel[]>;

  run = async (context: BrowserContext): Promise<Imovel[]> => {
    const start = Date.now();
    const page = await context.newPage();
    try {
      logger.info("scraper.start", { scraper: this.name });
      await this.setup(page);
      const raw = await this.scrape(page);
      const mapped = await this.map(raw);
      const validated = await this.validate(mapped);
      logger.info("scraper.done", {
        scraper: this.name,
        count: validated.length,
        ms: Date.now() - start,
      });
      return validated;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      logger.error("scraper.error", { scraper: this.name, error: message });
      await page.screenshot({ path: `logs/${this.name}-error.png` });
      throw error;
    } finally {
      await page.close();
    }
  };
}
