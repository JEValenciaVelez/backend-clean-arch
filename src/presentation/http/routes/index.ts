import { Router } from 'express';

import { IContainer } from '@/presentation/container/container';

import { authRouter } from './admin/auth';

/**
 * Aggregates all API routers under a single versioned router.
 */
export function buildRoutes(container: IContainer): Router {
  const router = Router();

  router.use('/admin/auth', authRouter(container));

  return router;
}
