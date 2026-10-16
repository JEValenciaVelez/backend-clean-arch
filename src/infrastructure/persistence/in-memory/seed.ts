import { IHashService } from '@/application/ports/IHashService';
import { buildProfile } from '@/infrastructure/persistence/in-memory/InMemoryProfileRepository';

/**
 * Seeds demo users so the login flow can be exercised without a database.
 * Only used in non-production environments.
 *
 * Demo credentials:
 *   country:   CO
 *   cellphone: 3000000000
 *   password:  password
 */
export async function seedDevUsers(
  repository: { seed: (profile: ReturnType<typeof buildProfile>) => void },
  hashService: IHashService
): Promise<void> {
  const passwordHash = await hashService.hash('password');

  repository.seed(
    buildProfile({
      userId: 'dev-user-1',
      email: 'dev@example.com',
      country: 'CO',
      cellphone: '3000000000',
      passwordHash,
      name: 'Dev User',
    })
  );
}
