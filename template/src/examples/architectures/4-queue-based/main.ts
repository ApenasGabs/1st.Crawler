import fs from "fs";
import winston from "winston";
import { chromium } from "playwright";
import { QuoteJob } from "./QuoteJob";
import { BookJob } from "./BookJob";
import type { JobResult } from "./IJob";

/**
 * Simulador de Queue-Based (sem Redis/Bull complexo)
 * Em produção, usar Bull Queue com Redis
 * 
 * Demonstra conceito:
 * - Jobs como tarefas independentes
 * - Execução sequencial com retry
 * - Histórico de resultados
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

interface JobQueue {
  name: string;
  maxRetries: number;
}

const main = async (): Promise<void> => {
  const browser = await chromium.launch({
    headless: process.env.BROWSER_HEADLESS !== "false",
  });

  try {
    // Definir jobs a executar
    const jobDefinitions: JobQueue[] = [
      { name: "quote-scrape", maxRetries: 2 },
      { name: "book-scrape", maxRetries: 2 },
    ];

    const results: JobResult[] = [];

    for (const jobDef of jobDefinitions) {
      let attempts = 0;
      let success = false;

      while (attempts < jobDef.maxRetries && !success) {
        attempts++;
        logger.info(`[${jobDef.name}] Tentativa ${attempts}/${jobDef.maxRetries}`);

        const context = await browser.newContext();

        try {
          let result: JobResult;

          if (jobDef.name === "quote-scrape") {
            const job = new QuoteJob(context, logger);
            result = await job.execute();
          } else if (jobDef.name === "book-scrape") {
            const job = new BookJob(context, logger);
            result = await job.execute();
          } else {
            throw new Error(`Job desconhecido: ${jobDef.name}`);
          }

          results.push(result);

          if (result.success) {
            success = true;
            logger.info(
              `✅ ${jobDef.name}: ${result.records.length} registros em ${result.duration}ms`
            );
          } else {
            logger.warn(`⚠️ ${jobDef.name}: ${result.error}`);
          }
        } catch (error) {
          logger.error(`❌ ${jobDef.name} falhou:`, error);
        } finally {
          await context.close();
        }

        if (!success && attempts < jobDef.maxRetries) {
          logger.info(`Aguardando ${process.env.RETRY_DELAY || 5} segundos...`);
          await new Promise((resolve) =>
            setTimeout(resolve, (parseInt(process.env.RETRY_DELAY || "5") * 1000))
          );
        }
      }
    }

    // Consolidar e salvar resultados
    const allRecords: unknown[] = [];
    for (const result of results) {
      if (result.success) {
        allRecords.push(...result.records);
      }
    }

    fs.mkdirSync(process.env.DATA_OUTPUT_DIR || "data", { recursive: true });
    fs.writeFileSync(
      `${process.env.DATA_OUTPUT_DIR || "data"}/merged.json`,
      JSON.stringify(allRecords, null, 2)
    );

    // Salvar histórico de jobs
    fs.writeFileSync(
      `${process.env.DATA_OUTPUT_DIR || "data"}/job-history.json`,
      JSON.stringify(results, null, 2)
    );

    logger.info(`✅ Pipeline Queue-Based concluído: ${allRecords.length} registros`);
    logger.info(
      `📊 Histórico salvo em: ${process.env.DATA_OUTPUT_DIR || "data"}/job-history.json`
    );
  } catch (error) {
    logger.error("Erro no pipeline:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
};

void main();
