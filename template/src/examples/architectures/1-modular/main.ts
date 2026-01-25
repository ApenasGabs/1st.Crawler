import winston from "winston";
import { BrowserPool } from "./BrowserPool";
import { QuoteScraper } from "./QuoteScraper";
import { BookScraper } from "./BookScraper";
import { mergeAndValidate } from "./merge";
import type { Record } from "./types";

/**
 * Main: Orquestrador da arquitetura Modular
 * 1. Cria pool de browser
 * 2. Roda scrapers em paralelo
 * 3. Faz merge e validação
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const main = async (): Promise<void> => {
  const pool = new BrowserPool(2, logger);
  const allRecords: Record[] = [];

  try {
    await pool.init();

    // Executar scrapers em paralelo
    const quoteContext = await pool.getContext();
    const bookContext = await pool.getContext();

    const [quotes, books] = await Promise.all([
      new QuoteScraper(
        quoteContext,
        logger,
        "QuoteScraper",
        "https://quotes.toscrape.com/",
      ).run(),
      new BookScraper(
        bookContext,
        logger,
        "BookScraper",
        "https://books.toscrape.com/",
      ).run(),
    ]);

    pool.releaseContext(quoteContext);
    pool.releaseContext(bookContext);

    allRecords.push(...quotes, ...books);

    // Merge e validação
    await mergeAndValidate(allRecords, logger);

    logger.info(`✅ Pipeline concluído: ${allRecords.length} registros`);
  } catch (error) {
    logger.error("Erro no pipeline:", error);
    process.exit(1);
  } finally {
    await pool.cleanup();
  }
};

void main();
