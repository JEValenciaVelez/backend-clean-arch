import express, { Express } from 'express';
import helmet from 'helmet';

import { IContainer } from '@/presentation/container/container';
import { errorHandler } from '@/presentation/http/errors/errorHandler';
import { languageMiddleware } from '@/presentation/http/middleware/language';
import { notFoundHandler } from '@/presentation/http/middleware/notFound';
import { buildRoutes } from '@/presentation/http/routes';

export const API_PREFIX = '/api/v1';

/**
 * Builds the Express application from the container. Kept side-effect free so it
 * can be reused by integration tests with a fake container.
 */
export function createServer(container: IContainer): Express {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '5mb' }));

  app.use(languageMiddleware);
  app.use(API_PREFIX, buildRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler(container.logger));

  return app;
}
