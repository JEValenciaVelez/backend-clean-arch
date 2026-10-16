import { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '@/shared/constants';

/** Turns any unmatched route into a 404 AppError handled by the error handler. */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: {
      code: 'page.notFound',
      message: req.translate?.('page.notFound') ?? 'Page not found',
    },
  });
}
