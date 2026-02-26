import type { BrowserContext } from "playwright";
import type { Logger } from "winston";
import type { RawData, ScrapedRecord } from "./types";

/**
 * Contrato abstrato para scrapers
 * Cada scraper implementa: setup, scrape, map, validate
 */
export abstract class BaseScraper {
  constructor(
    protected context: BrowserContext,
    protected logger: Logger,
    public name: string,
    public url: string,
  ) {}

  /**
   * Setup: preparar página (login, cookies, etc)
   */
  async setup(): Promise<void> {
    // Override em subclasses se necessário
  }

  /**
   * Scrape: extrair dados brutos
   */
  abstract scrape(): Promise<RawData[]>;

  /**
   * Map: transformar RawData → Record
   */
  abstract map(rawData: RawData[]): ScrapedRecord[];

  /**
   * Validate: verificar se dados estão válidos
   */
  validate(records: ScrapedRecord[]): boolean {
    return records.length > 0;
  }

  /**
   * Run: executa pipeline completo
   */
  async run(): Promise<ScrapedRecord[]> {
    const startTime = Date.now();
    try {
      this.logger.info(`[${this.name}] Iniciando scrape`);

      await this.setup();
      const rawData = await this.scrape();
      const records = this.map(rawData);

      if (!this.validate(records)) {
        throw new Error("Validação falhou");
      }

      const duration = Date.now() - startTime;
      this.logger.info(
        `[${this.name}] Concluído: ${records.length} registros em ${duration}ms`,
      );
      return records;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[${this.name}] Erro após ${duration}ms:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
