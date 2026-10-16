import { z } from 'zod';

import {
  cellphoneOrUsernameSchema,
  countryCodeSchema,
  passwordSchema,
} from '@/shared/validation/schemas';

export const loginSchema = z.object({
  cellphone: cellphoneOrUsernameSchema,
  password: passwordSchema,
  country: countryCodeSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface ILoginOutput {
  token: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}
