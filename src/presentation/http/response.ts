import { Request, Response } from 'express';
import moment from 'moment';

import { HTTP_STATUS, HttpStatus } from '@/shared/constants';

export interface IResponseOptions {
  status?: HttpStatus;
  meta?: Record<string, unknown>;
}

/**
 * Standardized success envelope used by every endpoint:
 *   { data, meta? }
 * and always sets request-id / timestamp headers.
 */
export function response(res: Response, req: Request) {
  return function send<T>(data: T, options: IResponseOptions = {}): void {
    const { status = HTTP_STATUS.OK, meta } = options;

    res.setHeader('request-id', req.requestId ?? '');
    res.setHeader('timestamp', moment().format());

    res.status(status).json({
      data,
      ...(meta ? { meta } : {}),
    });
  };
}
