import type { ReactElement, ReactNode } from "react";

/**
 * Record genérico para dados extraídos
 */
export interface Record {
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
