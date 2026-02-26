/**
 * Domínio: Types genéricos para qualquer fonte de dados
 */
export interface ContentRecord {
  id: string;
  source: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  externalUrl: string;
}

/**
 * Adapter interface que todas as fontes devem implementar
 */
export interface IDataAdapter {
  name: string;
  source: string;

  fetch(): Promise<unknown[]>;
  transform(raw: unknown[]): ContentRecord[];
  validate(records: ContentRecord[]): boolean;
}
