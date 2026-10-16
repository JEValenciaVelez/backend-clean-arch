import { AsyncLocalStorage } from 'async_hooks';

/**
 * Per-request context propagated through the async call stack.
 * Populated by the presentation layer so infrastructure/services can access
 * request-scoped data (id, user, logger) without threading it manually.
 */
export interface IRequestContext {
  requestId: string;
  userId?: string;
  logger?: unknown;
}

export const requestContext = new AsyncLocalStorage<IRequestContext>();
