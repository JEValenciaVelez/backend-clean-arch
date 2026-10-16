import { z } from 'zod';

import { HTTP_STATUS } from '@/shared/constants';
import { AppError } from '@/shared/errors/AppError';
import { TranslationKey } from '@/shared/i18n';

/**
 * Validates `input` against a Zod schema and throws an `AppError` (400) with
 * the first issue as i18n code and the flattened field errors when it fails.
 * Error messages may encode args using the `code|arg1|arg2` convention.
 */
export function validate<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown
): z.infer<Schema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const firstError = result.error.issues[0].message;

    let code: TranslationKey = firstError as TranslationKey;
    let codeArgs: string[] | undefined;
    if (firstError.includes('|')) {
      const [head, ...rest] = firstError.split('|');
      code = head as TranslationKey;
      codeArgs = rest;
    }

    throw new AppError({
      code,
      status: HTTP_STATUS.BAD_REQUEST,
      codeArgs,
      errors: z.flattenError(result.error).fieldErrors as Record<string, unknown>,
    });
  }

  return result.data;
}
