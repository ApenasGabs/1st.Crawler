import { SiteAScraper } from "./siteA/SiteAScraper";
import { SiteBScraper } from "./siteB/SiteBScraper";
import type { BaseScraper } from "./base/BaseScraper";

export const scraperRegistry: BaseScraper[] = [
  new SiteAScraper({
    userAgent: "crawler/1.0",
    maxDurationMs: 2 * 60 * 60 * 1000,
  }),
  new SiteBScraper({
    userAgent: "crawler/1.0",
    maxDurationMs: 2 * 60 * 60 * 1000,
  }),
];
