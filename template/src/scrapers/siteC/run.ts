import { SiteCScraper } from "./SiteCScraper";

const main = async (): Promise<void> => {
  const scraper = new SiteCScraper({
    userAgent: "crawler/1.0",
    maxDurationMs: 30_000,
  });
  const data = await scraper.run();
  console.log(JSON.stringify(data, null, 2));
};

main().catch(console.error);
