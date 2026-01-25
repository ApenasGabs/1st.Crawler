import type { Logger } from "winston";
import type { IDataAdapter, ContentRecord } from "./types";

/**
 * Serviço de aplicação que coordena adapters
 * Roda múltiplos adapters em paralelo
 */
export class ScraperService {
  constructor(private logger: Logger) {}

  async runAdapters(adapters: IDataAdapter[]): Promise<ContentRecord[]> {
    this.logger.info(`Executando ${adapters.length} adapters em paralelo`);

    const results = await Promise.allSettled(
      adapters.map(async (adapter) => {
        try {
          const raw = await adapter.fetch();
          const transformed = adapter.transform(raw);

          if (!adapter.validate(transformed)) {
            throw new Error(`Validação falhou para ${adapter.name}`);
          }

          this.logger.info(
            `✅ ${adapter.name}: ${transformed.length} registros`,
          );
          return transformed;
        } catch (error) {
          this.logger.error(
            `❌ ${adapter.name}:`,
            error instanceof Error ? error.message : String(error),
          );
          throw error;
        }
      }),
    );

    const allRecords: ContentRecord[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allRecords.push(...result.value);
      }
    }

    return allRecords;
  }
}
