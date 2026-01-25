/**
 * Interface de Job para Queue
 */
export interface IJob {
  name: string;
  execute(): Promise<JobResult>;
}

/**
 * Resultado padronizado de job
 */
export interface JobResult {
  jobName: string;
  success: boolean;
  records: unknown[];
  duration: number;
  error?: string;
  timestamp: string;
}
