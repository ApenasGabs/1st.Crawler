import { chromium, type Browser, type BrowserContext } from "playwright";
import type { Logger } from "winston";

/**
 * Pool de contextos do browser para paralelização
 * Reutiliza browser principal e cria múltiplos contextos
 */
export class BrowserPool {
  private browser: Browser | null = null;
  private contexts: BrowserContext[] = [];
  private availableContexts: BrowserContext[] = [];

  constructor(
    private poolSize: number,
    private logger: Logger,
  ) {}

  /**
   * Inicializa browser e cria contextos do pool
   */
  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.BROWSER_HEADLESS !== "false",
    });

    for (let i = 0; i < this.poolSize; i++) {
      const context = await this.browser.newContext();
      this.contexts.push(context);
      this.availableContexts.push(context);
    }

    this.logger.info(`Pool iniciado com ${this.poolSize} contextos`);
  }

  /**
   * Obtém um contexto disponível (bloqueante se nenhum disponível)
   */
  async getContext(): Promise<BrowserContext> {
    while (this.availableContexts.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const context = this.availableContexts.pop();
    if (!context) throw new Error("Erro ao obter contexto do pool");
    return context;
  }

  /**
   * Devolve contexto ao pool
   */
  releaseContext(context: BrowserContext): void {
    this.availableContexts.push(context);
  }

  /**
   * Fecha tudo
   */
  async cleanup(): Promise<void> {
    for (const context of this.contexts) {
      await context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    this.logger.info("Pool de browser fechado");
  }
}
