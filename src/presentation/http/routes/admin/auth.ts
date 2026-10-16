import { Router } from 'express';

import { IContainer } from '@/presentation/container/container';
import { makeLoginController } from '@/presentation/http/controllers/auth/login.controller';
import { isect } from '@/presentation/http/isect';

export function authRouter(container: IContainer): Router {
  const router = Router();

  router.post('/login', isect(makeLoginController(container.useCases.login)));

  return router;
}
