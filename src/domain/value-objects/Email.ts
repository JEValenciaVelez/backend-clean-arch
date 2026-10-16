import { DomainError } from '@/domain/errors/DomainError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Immutable Email value object. Validates on construction so an invalid Email
 * can never exist inside the domain.
 */
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new DomainError({ code: 'invalid.body', message: `Invalid email: ${value}` });
    }
    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
