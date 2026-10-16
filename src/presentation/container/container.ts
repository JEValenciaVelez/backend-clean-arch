import { ICacheService } from '@/application/ports/ICacheService';
import { ILogger } from '@/application/ports/ILogger';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { env } from '@/infrastructure/config/env';
import { PinoLogger } from '@/infrastructure/logging/PinoLogger';
import { InMemoryProfileRepository } from '@/infrastructure/persistence/in-memory/InMemoryProfileRepository';
import { seedDevUsers } from '@/infrastructure/persistence/in-memory/seed';
import { JwtTokenService } from '@/infrastructure/services/JwtTokenService';
import { RedisCacheService } from '@/infrastructure/services/RedisCacheService';
import { ScryptHashService } from '@/infrastructure/services/ScryptHashService';

/**
 * Composition root. This is the ONLY place that knows concrete implementations.
 * Wiring lives here so domain/application stay decoupled from technology.
 *
 * Swapping persistence (e.g. to Prisma) is a one-line change below.
 */
export interface IContainer {
  logger: ILogger;
  cache: ICacheService;
  useCases: {
    login: LoginUseCase;
  };
}

export async function createContainer(): Promise<IContainer> {
  const logger: ILogger = new PinoLogger();
  const cache: ICacheService = new RedisCacheService(logger);
  const hashService = new ScryptHashService();
  const tokenService = new JwtTokenService({
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  });

  // B1: in-memory persistence until a real database is connected.
  const profileRepository = new InMemoryProfileRepository();
  if (env.NODE_ENV !== 'production') {
    await seedDevUsers(profileRepository, hashService);
  }

  return {
    logger,
    cache,
    useCases: {
      login: new LoginUseCase(profileRepository, hashService, tokenService),
    },
  };
}
