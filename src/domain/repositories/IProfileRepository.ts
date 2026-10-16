import { Profile } from '@/domain/entities/Profile';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

/**
 * Port (interface) that the application depends on. Implemented in
 * infrastructure (Prisma, in-memory, etc.). The domain/application never know
 * which concrete persistence is behind it.
 */
export interface IProfileRepository {
  findById(userId: string): Promise<Profile | null>;
  findByPhone(phone: PhoneNumber): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
}
