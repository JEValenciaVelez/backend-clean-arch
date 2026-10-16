export interface ILogEntry {
  error: unknown;
  method: string;
  userId?: string | null;
  path?: string | null;
  body?: unknown;
  headers?: unknown;
}

export interface IQueryLog {
  type: 'LowQuery' | 'ErrorQuery';
  ms: number;
  sql: string;
  description?: string;
  path?: string | null;
}

/**
 * Port for structured logging. Implemented in infrastructure (Pino + Axiom).
 */
export interface ILogger {
  error(entry: ILogEntry): void;
  info(message: string, meta?: Record<string, unknown>): void;
  query(entry: IQueryLog): void;
}
