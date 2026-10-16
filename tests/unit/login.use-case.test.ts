import { describe, expect, it } from 'vitest';

import { IHashService } from '@/application/ports/IHashService';
import { ITokenPayload, ITokenService } from '@/application/ports/ITokenService';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { Profile } from '@/domain/entities/Profile';
import { InvalidCredentialsError } from '@/domain/errors/DomainError';
import { IProfileRepository } from '@/domain/repositories/IProfileRepository';
import { Email } from '@/domain/value-objects/Email';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

const VALID_CELLPHONE = '3000000000';

function makeProfile(overrides: Partial<{ blocked: boolean }> = {}): Profile {
  return new Profile({
    userId: 'user-1',
    email: new Email('user@example.com'),
    phone: new PhoneNumber('CO', VALID_CELLPHONE),
    passwordHash: 'hashed',
    name: 'Jane Doe',
    avatarUrl: null,
    blocked: overrides.blocked ?? false,
  });
}

class FakeProfileRepository implements IProfileRepository {
  constructor(private readonly profile: Profile | null) {}
  async findById(): Promise<Profile | null> {
    return this.profile;
  }
  async findByPhone(phone: PhoneNumber): Promise<Profile | null> {
    if (this.profile && this.profile.phone.equals(phone)) return this.profile;
    return null;
  }
  async findByEmail(): Promise<Profile | null> {
    return this.profile;
  }
  async save(): Promise<void> {
    /* noop */
  }
}

class FakeHashService implements IHashService {
  constructor(private readonly matches: boolean) {}
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async compare(): Promise<boolean> {
    return this.matches;
  }
}

class FakeTokenService implements ITokenService {
  sign(payload: ITokenPayload): string {
    return `token:${payload.sub}`;
  }
  verify(): ITokenPayload {
    return { sub: 'user-1' };
  }
}

describe('LoginUseCase', () => {
  it('returns a token and public user when credentials are valid', async () => {
    const useCase = new LoginUseCase(
      new FakeProfileRepository(makeProfile()),
      new FakeHashService(true),
      new FakeTokenService()
    );

    const result = await useCase.execute({
      cellphone: VALID_CELLPHONE,
      password: 'password',
      country: 'CO',
    });

    expect(result.token).toBe('token:user-1');
    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'user@example.com',
      avatarUrl: null,
    });
  });

  it('throws InvalidCredentialsError when the password does not match', async () => {
    const useCase = new LoginUseCase(
      new FakeProfileRepository(makeProfile()),
      new FakeHashService(false),
      new FakeTokenService()
    );

    await expect(
      useCase.execute({ cellphone: VALID_CELLPHONE, password: 'wrong', country: 'CO' })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('throws InvalidCredentialsError when the profile does not exist', async () => {
    const useCase = new LoginUseCase(
      new FakeProfileRepository(null),
      new FakeHashService(true),
      new FakeTokenService()
    );

    await expect(
      useCase.execute({ cellphone: VALID_CELLPHONE, password: 'password', country: 'CO' })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
