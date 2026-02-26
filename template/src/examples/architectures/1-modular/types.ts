/**
 * Record genérico para dados extraídos
 */
export interface ScrapedRecord {
  id: string;
  source: string;
  title: string;
  description?: string;
  price?: number | string;
  location?: string;
  url: string;
  metadata?: globalThis.Record<string, unknown>;
  createdAt: string;
}

/**
 * Dados brutos antes da transformação
 */
export interface RawData {
  id: string;
  title: string;
  description?: string;
  price?: number | string;
  location?: string;
  url: string;
}
