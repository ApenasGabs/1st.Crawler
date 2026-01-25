import type { Logger } from "winston";
import type { IPlugin, PluginOutput } from "./IPlugin";

/**
 * Registro centralizado de plugins
 */
export class PluginRegistry {
  private plugins: Map<string, IPlugin> = new Map();

  constructor(private logger: Logger) {}

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      this.logger.warn(`Plugin ${plugin.name} já registrado, substituindo`);
    }
    this.plugins.set(plugin.name, plugin);
    this.logger.info(`✅ Plugin registrado: ${plugin.name} v${plugin.version}`);
  }

  unregister(name: string): void {
    this.plugins.delete(name);
    this.logger.info(`❌ Plugin removido: ${name}`);
  }

  getEnabled(): IPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.enabled);
  }

  getAll(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  get(name: string): IPlugin | undefined {
    return this.plugins.get(name);
  }

  async initAll(): Promise<void> {
    for (const plugin of this.getEnabled()) {
      try {
        await plugin.init();
      } catch (error) {
        this.logger.error(`Erro ao inicializar ${plugin.name}:`, error);
      }
    }
  }

  async executeAll(): Promise<PluginOutput[]> {
    const outputs: PluginOutput[] = [];

    for (const plugin of this.getEnabled()) {
      try {
        const output = await plugin.execute();
        outputs.push(output);
      } catch (error) {
        outputs.push({
          pluginName: plugin.name,
          records: [],
          duration: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return outputs;
  }

  async destroyAll(): Promise<void> {
    for (const plugin of this.getEnabled()) {
      try {
        await plugin.destroy();
      } catch (error) {
        this.logger.error(`Erro ao destruir ${plugin.name}:`, error);
      }
    }
  }
}
