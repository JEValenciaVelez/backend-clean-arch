import { Router } from 'express';

import { IContainer } from '@/presentation/container/container';
import { makeLoginController } from '@/presentation/http/controllers/auth/login.controller';
import { isect } from '@/presentation/http/isect';
import { rateLimit } from '@/presentation/http/middleware/rateLimit';
import { RATE_LIMITS } from '@/shared/constants';

export function authRouter(container: IContainer): Router {
  const router = Router();

  router.post(
    '/login',
    rateLimit({ windowMs: RATE_LIMITS.LOGIN.windowMs, max: RATE_LIMITS.LOGIN.max }),
    isect(makeLoginController(container.useCases.login))
  );

  return router;
}
