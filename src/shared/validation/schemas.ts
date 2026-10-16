import { z } from 'zod';

/**
 * Reusable Zod schemas. Error messages are i18n keys resolved later by the
 * presentation layer, so they must exist in `shared/i18n`.
 */

export const stringSchema = z
  .string({ error: 'validators.string.type' })
  .max(255, { error: 'validators.string.maxLength' });

export const textareaSchema = z
  .string({ error: 'validators.string.type' })
  .max(2000, { error: 'validators.textarea.maxLength' });

export const unsignedIntSchema = z
  .number({ error: 'validators.unsignedInt.type' })
  .int({ error: 'validators.unsignedInt.int' })
  .min(0, { error: 'validators.unsignedInt.min' })
  .max(4_294_967_295, { error: 'validators.unsignedInt.max' });

export const booleanSchema = z.preprocess(
  (val) => {
    if (val === 0) return false;
    if (val === 1) return true;
    return val;
  },
  z.boolean({ error: 'validators.boolean.type' })
);

export const urlSchema = z
  .url({ error: 'validators.url.type' })
  .min(3, { error: 'validators.url.minLength' })
  .max(191, { error: 'validators.url.maxLength' });

export const cellphoneOrUsernameSchema = z
  .string({ error: 'validators.cellphone.type' })
  .min(3, { error: 'validators.cellphone.minLength' })
  .max(64, { error: 'validators.cellphone.maxLength' });

export const passwordSchema = z
  .string({ error: 'validators.password.type' })
  .min(3, { error: 'validators.password.minLength' })
  .max(64, { error: 'validators.password.maxLength' });

export const countryCodeSchema = z
  .string({ error: 'validators.countryCode.type' })
  .regex(/^[A-Z]+$/, { error: 'validators.countryCode.regex' })
  .min(2, { error: 'validators.countryCode.minLength' })
  .max(3, { error: 'validators.countryCode.maxLength' });

export const uuidSchema = z.uuid({ error: 'validators.uuid.type' });

export const dateSchema = z.preprocess(
  (val) => (typeof val === 'string' || typeof val === 'number' ? new Date(val) : val),
  z.date({ error: 'validators.date.type' })
);
