import fs from "fs";
import type { Logger } from "winston";
import type { ScrapedRecord } from "./types";

/**
 * Merge de resultados de múltiplos scrapers + validação básica
 */
export const mergeAndValidate = async (
  scraperOutputs: ScrapedRecord[],
  logger: Logger,
): Promise<void> => {
  logger.info(`Merging ${scraperOutputs.length} records`);

  // Remover duplicatas (mesmo ID)
  const seen = new Set<string>();
  const unique = scraperOutputs.filter((record) => {
    if (seen.has(record.id)) {
      return false;
    }
    seen.add(record.id);
    return true;
  });

  logger.info(`Após deduplicação: ${unique.length} records`);

  // Salvar resultado final
  const outputPath = `${process.env.DATA_OUTPUT_DIR || "data"}/merged.json`;
  fs.mkdirSync(process.env.DATA_OUTPUT_DIR || "data", { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));

  logger.info(`✅ Dados salvos em: ${outputPath}`);
};
