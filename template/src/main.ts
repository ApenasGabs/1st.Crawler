import fs from "fs";
import { BrowserPool } from "./pipeline/BrowserPool";
import { ParallelExecutor } from "./pipeline/ParallelExecutor";
import {
  browserScraperRegistry,
  httpScraperRegistry,
} from "./scrapers/registry";

const run = async (): Promise<void> => {
  const allResults: { source: string; data: unknown[] }[] = [];

  // ── 1. HTTP scrapers primeiro (SSR — mais rápido, sem browser) ───────────
  if (httpScraperRegistry.length > 0) {
    console.log(
      `\n⚡ Rodando ${httpScraperRegistry.length} scraper(s) HTTP (SSR)…`,
    );
    const httpResults = await Promise.allSettled(
      httpScraperRegistry.map((s) => s.run()),
    );

    httpResults.forEach((r, i) => {
      const name = httpScraperRegistry[i].name;
      if (r.status === "fulfilled") {
        allResults.push({ source: name, data: r.value });
      } else {
        console.error(`❌ HTTP scraper ${name}: ${r.reason}`);
      }
    });
  }

  // ── 2. Browser scrapers (CSR — Playwright) ──────────────────────────────
  if (browserScraperRegistry.length > 0) {
    console.log(
      `\n🌐 Rodando ${browserScraperRegistry.length} scraper(s) Playwright (CSR)…`,
    );
    const pool = new BrowserPool(3);
    await pool.initialize();
    try {
      const executor = new ParallelExecutor(pool, 5 * 60 * 60 * 1000);
      const results = await executor.runAll(browserScraperRegistry);

      results.forEach((r) => {
        if (r.status === "success" && r.data) {
          allResults.push({ source: r.scraper, data: r.data });
        } else if (r.status === "failed") {
          console.error(`❌ Browser scraper ${r.scraper}: ${r.error}`);
        }
      });
    } finally {
      await pool.cleanup();
    }
  }

  // ── 3. Persistir resultados ──────────────────────────────────────────────
  fs.mkdirSync("data/scrapers", { recursive: true });

  for (const { source, data } of allResults) {
    fs.writeFileSync(
      `data/scrapers/${source}.json`,
      JSON.stringify(data, null, 2),
    );
  }

  console.log("\n✅ Scraping finalizado:", {
    total: allResults.length,
    items: allResults.reduce((acc, r) => acc + r.data.length, 0),
  });
};

void run();
