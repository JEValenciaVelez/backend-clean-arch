import { DomainError } from '@/domain/errors/DomainError';

/**
 * Immutable PhoneNumber value object composed of a country code and a national
 * number. Validates basic shape on construction.
 */
export class PhoneNumber {
  private readonly _country: string;
  private readonly _number: string;

  constructor(country: string, number: string) {
    const normalizedCountry = country.trim().toUpperCase();
    const normalizedNumber = number.replace(/\s+/g, '');

    if (!/^[A-Z]{2,3}$/.test(normalizedCountry)) {
      throw new DomainError({ code: 'invalid.body', message: `Invalid country code: ${country}` });
    }
    if (!/^\d{6,15}$/.test(normalizedNumber)) {
      throw new DomainError({ code: 'invalid.body', message: `Invalid phone number: ${number}` });
    }

    this._country = normalizedCountry;
    this._number = normalizedNumber;
  }

  get country(): string {
    return this._country;
  }

  get number(): string {
    return this._number;
  }

  equals(other: PhoneNumber): boolean {
    return this._country === other.country && this._number === other.number;
  }

  toString(): string {
    return `${this._country}${this._number}`;
  }
}
