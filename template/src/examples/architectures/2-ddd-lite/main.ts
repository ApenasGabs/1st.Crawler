import winston from "winston";
import { chromium } from "playwright";
import { ScraperService } from "./ScraperService";
import { MergeService } from "./MergeService";
import { QuoteAdapter } from "./QuoteAdapter";
import { BookAdapter } from "./BookAdapter";

/**
 * Orquestrador DDD Lite
 * 1. Cria adapters
 * 2. Roda em paralelo via ScraperService
 * 3. Merge via MergeService
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const main = async (): Promise<void> => {
  const browser = await chromium.launch({
    headless: process.env.BROWSER_HEADLESS !== "false",
  });

  try {
    // Criar contextos
    const quoteContext = await browser.newContext();
    const bookContext = await browser.newContext();

    // Criar adapters
    const adapters = [
      new QuoteAdapter(quoteContext, logger),
      new BookAdapter(bookContext, logger),
    ];

    // Executar scrapers
    const scraperService = new ScraperService(logger);
    const records = await scraperService.runAdapters(adapters);

    // Fazer merge
    const mergeService = new MergeService(logger);
    const merged = mergeService.merge(records);
    mergeService.save(
      merged,
      `${process.env.DATA_OUTPUT_DIR || "data"}/merged.json`,
    );

    logger.info(`✅ Pipeline DDD concluído: ${merged.length} registros`);

    await quoteContext.close();
    await bookContext.close();
  } catch (error) {
    logger.error("Erro no pipeline:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
};

void main();
