import { NextFunction, Request, RequestHandler, Response } from 'express';

import { HTTP_STATUS } from '@/shared/constants';
import { AppError } from '@/shared/errors/AppError';

export interface IRateLimitOptions {
  /** Size of the fixed window in milliseconds. */
  windowMs: number;
  /** Max requests allowed per key within the window. */
  max: number;
  /** How to identify a caller. Defaults to the request IP. */
  keyGenerator?: (req: Request) => string;
  /** Number of tracked keys that triggers pruning of expired buckets. */
  cleanupThreshold?: number;
}

interface IBucket {
  count: number;
  resetAt: number;
}

/**
 * Dependency-free, in-memory fixed-window rate limiter.
 *
 * NOTE: counters live in the process, so with multiple cores/instances each
 * keeps its own. For a distributed deployment, back it with Redis through
 * `ICacheService`.
 */
export function rateLimit({
  windowMs,
  max,
  keyGenerator,
  cleanupThreshold = 10_000,
}: IRateLimitOptions): RequestHandler {
  const buckets = new Map<string, IBucket>();

  const prune = (now: number): void => {
    if (buckets.size < cleanupThreshold) return;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : (req.ip ?? 'unknown');
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      prune(now);
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      next(
        new AppError({
          code: 'server.tooManyRequests',
          status: HTTP_STATUS.TOO_MANY_REQUESTS,
        })
      );
      return;
    }

    next();
  };
}
