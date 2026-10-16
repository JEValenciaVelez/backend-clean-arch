import { HTTP_STATUS, HttpStatus } from '@/shared/constants';
import { TranslationKey } from '@/shared/i18n';

export interface IAppErrorProps {
  code: TranslationKey;
  message?: string;
  status?: HttpStatus;
  debugInfo?: string;
  codeArgs?: (string | number)[];
  errors?: Record<string, unknown>;
  err?: unknown;
}

/**
 * Base transport-agnostic error. Errors raised inside the app (domain,
 * application or infrastructure) extend this, carrying an i18n `code`, an HTTP
 * `status` and optional context. The presentation layer maps it to a response.
 */
export class AppError extends Error {
  public readonly code: TranslationKey;
  public readonly status: HttpStatus;
  public readonly codeArgs?: (string | number)[];
  public readonly errors?: Record<string, unknown>;
  public readonly debugInfo?: string;
  public readonly err?: unknown;

  constructor({
    code,
    message,
    status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    codeArgs,
    errors,
    debugInfo,
    err,
  }: IAppErrorProps) {
    super(message || '');
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.codeArgs = codeArgs;
    this.errors = errors;
    this.debugInfo = debugInfo;
    this.err = err;
  }
}
