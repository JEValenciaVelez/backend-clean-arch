import { Profile } from '@/domain/entities/Profile';
import { IProfileRepository } from '@/domain/repositories/IProfileRepository';
import { Email } from '@/domain/value-objects/Email';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

/**
 * In-memory implementation of the profile repository (B1 strategy).
 *
 * Used while there is no real database. Swap for a Prisma implementation later
 * without touching domain or application code: both satisfy IProfileRepository.
 */
export class InMemoryProfileRepository implements IProfileRepository {
  private readonly _profiles = new Map<string, Profile>();

  async findById(userId: string): Promise<Profile | null> {
    return this._profiles.get(userId) ?? null;
  }

  async findByPhone(phone: PhoneNumber): Promise<Profile | null> {
    for (const profile of this._profiles.values()) {
      if (profile.phone.equals(phone)) {
        return profile;
      }
    }
    return null;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    for (const profile of this._profiles.values()) {
      if (profile.email.value === email.trim().toLowerCase()) {
        return profile;
      }
    }
    return null;
  }

  async save(profile: Profile): Promise<void> {
    this._profiles.set(profile.userId, profile);
  }

  /** Test/bootstrap helper — not part of the port. */
  seed(profile: Profile): void {
    this._profiles.set(profile.userId, profile);
  }
}

/** Factory used by the seeder and tests. */
export function buildProfile(props: {
  userId: string;
  email: string;
  country: string;
  cellphone: string;
  passwordHash: string;
  name?: string | null;
  avatarUrl?: string | null;
  blocked?: boolean;
}): Profile {
  return new Profile({
    userId: props.userId,
    email: new Email(props.email),
    phone: new PhoneNumber(props.country, props.cellphone),
    passwordHash: props.passwordHash,
    name: props.name ?? null,
    avatarUrl: props.avatarUrl ?? null,
    blocked: props.blocked ?? false,
  });
}
