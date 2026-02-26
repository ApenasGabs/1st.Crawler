import type { BaseHttpScraper } from "./base/BaseHttpScraper";
import type { BaseScraper } from "./base/BaseScraper";
import { SiteAScraper } from "./siteA/SiteAScraper";
import { SiteBScraper } from "./siteB/SiteBScraper";
import { SiteCScraper } from "./siteC/SiteCScraper";

/** Scrapers CSR — precisam de BrowserContext (Playwright) */
export const browserScraperRegistry: BaseScraper[] = [
  new SiteAScraper({
    userAgent: "crawler/1.0",
    maxDurationMs: 2 * 60 * 60 * 1000,
  }),
  new SiteBScraper({
    userAgent: "crawler/1.0",
    maxDurationMs: 2 * 60 * 60 * 1000,
  }),
];

/** Scrapers SSR — rodam com fetch + cheerio, sem browser */
export const httpScraperRegistry: BaseHttpScraper[] = [
  new SiteCScraper({
    userAgent: "crawler/1.0",
    maxDurationMs: 60_000,
  }),
];

/**
 * @deprecated Use browserScraperRegistry / httpScraperRegistry.
 * Mantido para compatibilidade com main.ts existente.
 */
export const scraperRegistry: BaseScraper[] = browserScraperRegistry;
