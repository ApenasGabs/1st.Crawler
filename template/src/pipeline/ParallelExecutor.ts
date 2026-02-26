import type { ScrapedRecord } from "../domain/types";
import type { BaseScraper } from "../scrapers/base/BaseScraper";
import type { BrowserPool } from "./BrowserPool";

export interface ScraperResult {
  scraper: string;
  status: "success" | "failed";
  data?: ScrapedRecord[];
  error?: string;
  durationMs: number;
}

export class ParallelExecutor {
  constructor(
    private readonly pool: BrowserPool,
    private readonly perScraperTimeoutMs: number,
  ) {}

  runAll = async (scrapers: BaseScraper[]): Promise<ScraperResult[]> => {
    const results = await Promise.allSettled(
      scrapers.map(async (s) => {
        const start = Date.now();
        const ctx = await this.pool.getContext();
        try {
          const data = await this.withTimeout(
            s.run(ctx),
            this.perScraperTimeoutMs,
          );
          return {
            scraper: s.name,
            status: "success" as const,
            data,
            durationMs: Date.now() - start,
          };
        } catch (e) {
          const error = e instanceof Error ? e.message : "unknown";
          return {
            scraper: s.name,
            status: "failed" as const,
            error,
            durationMs: Date.now() - start,
          };
        } finally {
          await this.pool.release(ctx);
        }
      }),
    );
    return results.map((r) => (r.status === "fulfilled" ? r.value : r.reason));
  };

  private withTimeout = async <T>(p: Promise<T>, ms: number): Promise<T> => {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error(`timeout after ${ms}ms`)),
        ms,
      );
    });
    const result = await Promise.race([p, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result as T;
  };
}
