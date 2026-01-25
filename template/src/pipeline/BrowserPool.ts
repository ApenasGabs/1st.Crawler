import { chromium, type Browser, type BrowserContext } from "playwright";

export class BrowserPool {
  private browser: Browser | null = null;
  private contexts: BrowserContext[] = [];
  private available: BrowserContext[] = [];

  constructor(private readonly maxContexts: number) {}

  initialize = async (): Promise<void> => {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    for (let i = 0; i < this.maxContexts; i++) {
      const ctx = await this.browser.newContext();
      this.contexts.push(ctx);
      this.available.push(ctx);
    }
  };

  getContext = async (): Promise<BrowserContext> => {
    while (this.available.length === 0) {
      await new Promise((r) => setTimeout(r, 200));
    }
    const ctx = this.available.pop();
    if (!ctx) throw new Error("No context available");
    return ctx;
  };

  release = async (ctx: BrowserContext): Promise<void> => {
    this.available.push(ctx);
  };

  cleanup = async (): Promise<void> => {
    await Promise.all(this.contexts.map((c) => c.close()));
    await this.browser?.close();
  };
}
