import fs from "fs";
import winston from "winston";
import { chromium } from "playwright";
import { PluginRegistry } from "./PluginRegistry";
import { QuotePlugin } from "./QuotePlugin";
import { BookPlugin } from "./BookPlugin";

/**
 * Orquestrador Plugin-Based
 * 1. Cria registry
 * 2. Registra plugins
 * 3. Executa todos em paralelo
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

  const registry = new PluginRegistry(logger);

  try {
    // Criar contextos e plugins
    const quoteContext = await browser.newContext();
    const bookContext = await browser.newContext();

    const quotePlugin = new QuotePlugin(quoteContext, logger);
    const bookPlugin = new BookPlugin(bookContext, logger);

    // Registrar plugins
    registry.register(quotePlugin);
    registry.register(bookPlugin);

    // Inicializar todos
    await registry.initAll();

    // Executar todos em paralelo
    const outputs = await registry.executeAll();

    // Consolidar resultados
    const allRecords: unknown[] = [];
    for (const output of outputs) {
      if (output.success) {
        allRecords.push(...output.records);
        logger.info(
          `✅ ${output.pluginName}: ${output.records.length} registros em ${output.duration}ms`
        );
      } else {
        logger.error(`❌ ${output.pluginName}: ${output.error}`);
      }
    }

    // Salvar resultados
    fs.mkdirSync(process.env.DATA_OUTPUT_DIR || "data", { recursive: true });
    fs.writeFileSync(
      `${process.env.DATA_OUTPUT_DIR || "data"}/merged.json`,
      JSON.stringify(allRecords, null, 2)
    );

    logger.info(`✅ Pipeline Plugin-Based concluído: ${allRecords.length} registros`);

    // Cleanup
    await registry.destroyAll();
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
