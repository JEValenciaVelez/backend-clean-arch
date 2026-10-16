import crypto from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';

import { requestContext } from '@/shared/context/requestContext';

import { response } from './response';

/**
 * A controller is a thin function that receives a request, runs a use case and
 * returns the data to send. It must not know about HTTP formatting details.
 */
export type Controller = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

/**
 * Adapter that turns a `Controller` into an Express handler. It:
 *  - assigns a request id and opens the async request context
 *  - forwards every thrown error to the central error handler
 *  - sends the standardized response with whatever the controller returned
 *    (unless the controller already responded)
 */
export function isect(controller: Controller): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = req.requestId ?? crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('request-id', requestId);

    try {
      await requestContext.run({ requestId }, async () => {
        const result = await controller(req, res, next);
        if (!res.headersSent && result !== undefined) {
          response(res, req)(result);
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
