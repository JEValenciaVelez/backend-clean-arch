import { NextFunction, Request, Response } from 'express';

import { env } from '@/infrastructure/config/env';
import { translate } from '@/shared/i18n/translate';

const SUPPORTED = ['en', 'es'];

/**
 * Resolves the request language (query `lang` -> Accept-Language -> default) and
 * exposes a `translate` helper bound to it.
 */
export function languageMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const fromQuery = typeof req.query.lang === 'string' ? req.query.lang : undefined;
  const fromHeader = req.headers['accept-language']?.split(',')[0]?.slice(0, 2);

  const candidate = (fromQuery || fromHeader || env.DEFAULT_LANG).toLowerCase();
  const lang = SUPPORTED.includes(candidate) ? candidate : env.DEFAULT_LANG;

  req.lang = lang;
  req.translate = (key, args) => translate(lang, key, args);

  next();
}
