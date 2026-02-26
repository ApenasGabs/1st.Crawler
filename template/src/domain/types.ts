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

/**
 * Dados mapeados e prontos para validação/persistência.
 * Tipo genérico — renomeie ou estenda conforme seu domínio.
 */
export interface ScrapedRecord {
  id: string;
  source: string;
  title: string;
  description?: string;
  price?: number | string;
  location?: string | { city: string; state: string };
  url: string;
  metadata?: Record<string, unknown>;
}
