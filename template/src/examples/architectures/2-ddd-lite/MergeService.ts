import fs from "fs";
import type { Logger } from "winston";
import type { ContentRecord } from "./types";

/**
 * Serviço de aplicação para merge
 * Aplica regras de domínio no merge
 */
export class MergeService {
  constructor(private logger: Logger) {}

  merge(recordsBySource: ContentRecord[]): ContentRecord[] {
    this.logger.info(
      `Merging ${recordsBySource.length} records de múltiplas fontes`
    );

    // Deduplicar por ID
    const seen = new Set<string>();
    const unique = recordsBySource.filter((record) => {
      const key = `${record.source}#${record.id}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    // Ordenar por data
    const sorted = unique.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.logger.info(`Após merge: ${sorted.length} records únicos`);
    return sorted;
  }

  save(records: ContentRecord[], path: string): void {
    fs.mkdirSync(process.env.DATA_OUTPUT_DIR || "data", { recursive: true });
    fs.writeFileSync(path, JSON.stringify(records, null, 2));
    this.logger.info(`✅ Dados salvos em: ${path}`);
  }
}
