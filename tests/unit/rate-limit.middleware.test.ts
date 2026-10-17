import { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { rateLimit } from '@/presentation/http/middleware/rateLimit';
import { HTTP_STATUS } from '@/shared/constants';
import { AppError } from '@/shared/errors/AppError';

const makeReq = (ip: string): Request => ({ ip }) as unknown as Request;
const makeRes = (): Response => ({ setHeader: vi.fn() }) as unknown as Response;

describe('rateLimit middleware', () => {
  it('allows requests up to the limit and blocks the next one with 429', () => {
    const middleware = rateLimit({ windowMs: 60_000, max: 2 });
    const next = vi.fn();

    middleware(makeReq('1.1.1.1'), makeRes(), next);
    middleware(makeReq('1.1.1.1'), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenLastCalledWith();

    middleware(makeReq('1.1.1.1'), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(3);

    const error = next.mock.calls[2][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
  });

  it('tracks each caller separately', () => {
    const middleware = rateLimit({ windowMs: 60_000, max: 1 });
    const next = vi.fn();

    middleware(makeReq('1.1.1.1'), makeRes(), next);
    middleware(makeReq('2.2.2.2'), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
    for (const call of next.mock.calls) {
      expect(call).toEqual([]);
    }
  });

  it('accepts a custom key generator', () => {
    const middleware = rateLimit({ windowMs: 60_000, max: 1, keyGenerator: () => 'shared' });
    const next = vi.fn();

    middleware(makeReq('1.1.1.1'), makeRes(), next);
    middleware(makeReq('2.2.2.2'), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next.mock.calls[1][0]).toBeInstanceOf(AppError);
  });
});
