import { ILoginOutput, LoginInput } from '@/application/dtos/auth/LoginDto';
import { IHashService } from '@/application/ports/IHashService';
import { ITokenService } from '@/application/ports/ITokenService';
import { InvalidCredentialsError, UserBlockedError } from '@/domain/errors/DomainError';
import { IProfileRepository } from '@/domain/repositories/IProfileRepository';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

/**
 * Authenticates a user by phone/password and returns a signed token.
 *
 * Pure orchestration: depends only on ports (repository + services), never on
 * Express, Prisma or any specific technology. This is what makes it testable
 * with simple fakes.
 */
export class LoginUseCase {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: LoginInput): Promise<ILoginOutput> {
    const phone = new PhoneNumber(input.country, input.cellphone);

    const profile = await this.profileRepository.findByPhone(phone);
    if (!profile) {
      throw new InvalidCredentialsError();
    }

    if (profile.blocked) {
      throw new UserBlockedError();
    }

    const passwordMatches = await this.hashService.compare(input.password, profile.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.sign({ sub: profile.userId });

    return {
      token,
      user: profile.toPublic(),
    };
  }
}
