import crypto from 'crypto';
import { promisify } from 'util';

import { IHashService } from '@/application/ports/IHashService';

const scrypt = promisify(crypto.scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/**
 * Password hashing with Node's native scrypt (no native deps required).
 * Stored format: `scrypt$<saltHex>$<hashHex>`.
 */
export class ScryptHashService implements IHashService {
  async hash(plain: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = await scrypt(plain, salt, KEY_LENGTH);
    return `scrypt$${salt}$${derived.toString('hex')}`;
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    const [scheme, salt, key] = hashed.split('$');
    if (scheme !== 'scrypt' || !salt || !key) {
      return false;
    }

    const derived = await scrypt(plain, salt, KEY_LENGTH);
    const derivedHex = derived.toString('hex');

    const a = Buffer.from(derivedHex, 'hex');
    const b = Buffer.from(key, 'hex');
    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
  }
}
