import { HTTP_STATUS } from '@/shared/constants';
import { AppError, IAppErrorProps } from '@/shared/errors/AppError';

/**
 * Base class for business-rule violations. Kept separate from AppError so the
 * domain stays expressive and presentation can distinguish business errors
 * from technical/infrastructure ones if needed.
 *
 * Business errors default to 400 (client error); subclasses may override.
 */
export class DomainError extends AppError {
  constructor(props: Omit<IAppErrorProps, 'status'> & { status?: IAppErrorProps['status'] }) {
    super({ status: HTTP_STATUS.BAD_REQUEST, ...props });
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super({ code: 'invalid.credentials', status: HTTP_STATUS.UNAUTHORIZED });
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super({ code: 'user.notFound', status: HTTP_STATUS.NOT_FOUND });
  }
}

export class UserBlockedError extends DomainError {
  constructor() {
    super({ code: 'user.blocked', status: HTTP_STATUS.FORBIDDEN });
  }
}
