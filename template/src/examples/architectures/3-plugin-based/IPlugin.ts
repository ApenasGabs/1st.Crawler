/**
 * Interface de Plugin
 */
export interface IPlugin {
  name: string;
  version: string;
  enabled: boolean;

  init(): Promise<void>;
  execute(): Promise<PluginOutput>;
  destroy(): Promise<void>;
}

/**
 * Output padronizado de plugins
 */
export interface PluginOutput {
  pluginName: string;
  records: unknown[];
  duration: number;
  success: boolean;
  error?: string;
}
