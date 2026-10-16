import moment from 'moment';
import pino from 'pino';

import { ILogEntry, ILogger, IQueryLog } from '@/application/ports/ILogger';
import { env } from '@/infrastructure/config/env';

const CENSOR_FIELDS = [
  'password',
  'confirmpassword',
  'authorization',
  'x-access-token',
  'token',
  'pin',
  'otp',
];

function safeStringify(data: unknown): unknown {
  try {
    const type = typeof data;
    if (['string', 'number', 'boolean', 'undefined'].includes(type)) {
      return data;
    }
    return JSON.stringify(data || '', (key, value) => {
      const keyLower = `${key}`.toLowerCase();
      if (CENSOR_FIELDS.includes(keyLower) || CENSOR_FIELDS.includes(key)) {
        return '****';
      }
      return value;
    });
  } catch {
    return '';
  }
}

/**
 * Logger implementation (Pino/Axiom in production, console in dev).
 * Implements the application `ILogger` port so use-cases stay tech-agnostic.
 */
export class PinoLogger implements ILogger {
  private _errorLogger: pino.Logger | null = null;
  private _infoLogger: pino.Logger | null = null;
  private _queryLogger: pino.Logger | null = null;

  private _infos(): pino.Logger {
    if (!this._infoLogger) {
      this._infoLogger = env.API_TOKEN_PINO
        ? pino(
            { level: 'info' },
            pino.transport({
              target: '@axiomhq/pino',
              options: { dataset: 'app', token: env.API_TOKEN_PINO },
            })
          )
        : pino({ level: 'info' });
    }
    return this._infoLogger;
  }

  private _errors(): pino.Logger {
    if (!this._errorLogger) {
      this._errorLogger = env.API_TOKEN_PINO
        ? pino(
            { level: 'info' },
            pino.transport({
              target: '@axiomhq/pino',
              options: { dataset: 'errors', token: env.API_TOKEN_PINO },
            })
          )
        : pino({ level: 'info' });
    }
    return this._errorLogger;
  }

  private _queries(): pino.Logger {
    if (!this._queryLogger) {
      this._queryLogger = env.API_TOKEN_PINO
        ? pino(
            { level: 'info' },
            pino.transport({
              target: '@axiomhq/pino',
              options: { dataset: 'queries', token: env.API_TOKEN_PINO },
            })
          )
        : pino({ level: 'info' });
    }
    return this._queryLogger;
  }

  error(entry: ILogEntry): void {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('error-log', moment().format('DD/MM/YY HH:mm:ss'), entry.method, entry.error);
      return;
    }
    const stack = (entry.error as any)?.stack || '';
    this._errors().error({
      ...entry,
      error: safeStringify(entry.error),
      body: safeStringify(entry.body),
      headers: safeStringify(entry.headers),
      stack: safeStringify(stack),
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('info-log', moment().format('DD/MM/YY HH:mm:ss'), message, meta ?? '');
      return;
    }
    this._infos().info({ ...meta, msg: message });
  }

  query(entry: IQueryLog): void {
    if (env.NODE_ENV !== 'production') {
      console.warn('query-log', moment().format('DD/MM/YY HH:mm:ss'), entry);
      return;
    }
    const level = entry.type === 'LowQuery' ? 'warn' : 'error';
    this._queries()[level](entry);
  }
}
