import { loginSchema } from '@/application/dtos/auth/LoginDto';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { Controller } from '@/presentation/http/isect';
import { validate } from '@/shared/validation/validate';

/**
 * Thin HTTP adapter for the login use case. Responsibilities:
 *  1. validate the request body
 *  2. delegate to the use case
 *  3. return the data to be sent (isect wraps it into the response)
 * No business logic lives here.
 */
export function makeLoginController(loginUseCase: LoginUseCase): Controller {
  return async (req) => {
    const input = validate(loginSchema, req.body);
    return loginUseCase.execute(input);
  };
}
