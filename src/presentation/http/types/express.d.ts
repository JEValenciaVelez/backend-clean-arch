import { TranslationKey } from '@/shared/i18n';

declare global {
  namespace Express {
    // Augmenting Express' own `Request`; the name is fixed by the library.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Request {
      requestId?: string;
      lang?: string;
      translate?: (key: TranslationKey, args?: (string | number)[]) => string;
      /** Populated by the auth middleware once a token is verified. */
      auth?: { userId: string };
    }
  }
}

export {};
