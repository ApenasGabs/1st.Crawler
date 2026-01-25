import { BrowserPool } from "../../pipeline/BrowserPool";
import { SiteAScraper } from "./SiteAScraper";

const main = async (): Promise<void> => {
  const pool = new BrowserPool(1);
  await pool.initialize();
  try {
    const ctx = await pool.getContext();
    const scraper = new SiteAScraper({
      userAgent: "crawler/1.0",
      maxDurationMs: 60_000,
    });
    const data = await scraper.run(ctx);
    console.log(JSON.stringify(data, null, 2));
    await pool.release(ctx);
  } finally {
    await pool.cleanup();
  }
};

void main();
