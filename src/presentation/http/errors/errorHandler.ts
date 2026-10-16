import { ErrorRequestHandler } from 'express';

import { ILogger } from '@/application/ports/ILogger';
import { HTTP_STATUS } from '@/shared/constants';
import { AppError } from '@/shared/errors/AppError';
import { TranslationKey } from '@/shared/i18n';

/**
 * Single place where every error (domain, application or unexpected) becomes an
 * HTTP response. Business errors (`AppError`/`DomainError`) keep their status and
 * i18n code; anything else is reported as a generic 500 and logged.
 */
export function errorHandler(logger: ILogger): ErrorRequestHandler {
  return (error, req, _res, next): void => {
    // If the response already started, delegate to Express default handler.
    if (req.res?.headersSent) {
      next(error);
      return;
    }

    const isAppError = error instanceof AppError;
    const status = isAppError ? error.status : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const code: TranslationKey = isAppError ? error.code : 'server.error';

    if (!isAppError || status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      logger.error({
        error,
        method: `${req.method} ${req.originalUrl}`,
        path: req.originalUrl,
        body: req.body,
        headers: req.headers,
      });
    }

    const message = req.translate?.(code, isAppError ? error.codeArgs : undefined) ?? code;

    const res = req.res!;
    res.status(status).json({
      error: {
        code,
        message,
        ...(isAppError && error.errors ? { errors: error.errors } : {}),
      },
    });
  };
}
