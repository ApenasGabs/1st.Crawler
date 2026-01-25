import fs from "fs";
import { BrowserPool } from "./pipeline/BrowserPool";
import { ParallelExecutor } from "./pipeline/ParallelExecutor";
import { scraperRegistry } from "./scrapers/registry";

const run = async (): Promise<void> => {
  const pool = new BrowserPool(3);
  await pool.initialize();
  try {
    const executor = new ParallelExecutor(pool, 5 * 60 * 60 * 1000); // 5h por scraper
    const results = await executor.runAll(scraperRegistry);

    const ok = results
      .filter((r) => r.status === "success" && r.data)
      .flatMap((r) => r.data!);

    fs.mkdirSync("data/scrapers", { recursive: true });
    fs.writeFileSync(
      "data/scrapers/siteA.json",
      JSON.stringify(
        ok.filter((i) => i.source === "siteA"),
        null,
        2,
      ),
    );
    fs.writeFileSync(
      "data/scrapers/siteB.json",
      JSON.stringify(
        ok.filter((i) => i.source === "siteB"),
        null,
        2,
      ),
    );

    console.log("Scraping finished with:", {
      success: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
    });
  } finally {
    await pool.cleanup();
  }
};

void run();
