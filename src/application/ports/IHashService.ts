/**
 * Port for password hashing. Implemented in infrastructure (scrypt, bcrypt...).
 */
export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
