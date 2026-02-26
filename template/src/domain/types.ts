/**
 * Dados extraídos
 * Adapte conforme sua necessidade de domínio
 */
export interface ExtractedRecord {
  id: string;
  source: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  url: string;
  metadata?: Record<string, unknown>;
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
