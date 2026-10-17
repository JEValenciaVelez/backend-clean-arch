import crypto from 'crypto';

import { ITokenPayload, ITokenService } from '@/application/ports/ITokenService';
import { AppError } from '@/shared/errors/AppError';

interface IJwtTokenServiceProps {
  secret: string;
  expiresIn?: string;
}

/**
 * Minimal, dependency-free JWT (HS256) implementation. Good enough to keep the
 * structure self-contained; swap for `jsonwebtoken` in production if desired.
 */
export class JwtTokenService implements ITokenService {
  private readonly _secret: string;
  private readonly _expiresInSeconds: number;

  constructor({ secret, expiresIn = '7d' }: IJwtTokenServiceProps) {
    this._secret = secret;
    this._expiresInSeconds = this._parseExpiration(expiresIn);
  }

  sign(payload: ITokenPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + this._expiresInSeconds };

    const encodedHeader = this._base64Url(JSON.stringify(header));
    const encodedBody = this._base64Url(JSON.stringify(body));
    const signature = this._sign(`${encodedHeader}.${encodedBody}`);

    return `${encodedHeader}.${encodedBody}.${signature}`;
  }

  verify(token: string): ITokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new AppError({ code: 'auth.invalidToken' });
    }

    const [encodedHeader, encodedBody, signature] = parts;
    const expected = this._sign(`${encodedHeader}.${encodedBody}`);
    if (!this._safeEqual(signature, expected)) {
      throw new AppError({ code: 'auth.invalidToken' });
    }

    // Never trust a segment that fails to decode: a malformed token must be a
    // 401, not an unhandled SyntaxError turned into a 500.
    const header = this._decode(encodedHeader);
    const payload = this._decode(encodedBody) as ITokenPayload | null;

    if (!header || header.alg !== 'HS256') {
      throw new AppError({ code: 'auth.invalidToken' });
    }

    if (!payload || typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new AppError({ code: 'auth.invalidToken' });
    }

    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new AppError({ code: 'auth.expired' });
    }

    return payload;
  }

  private _decode(segment: string): Record<string, unknown> | null {
    try {
      const decoded = JSON.parse(Buffer.from(segment, 'base64url').toString());
      return decoded && typeof decoded === 'object' ? (decoded as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  private _sign(data: string): string {
    return crypto.createHmac('sha256', this._secret).update(data).digest('base64url');
  }

  private _base64Url(input: string): string {
    return Buffer.from(input).toString('base64url');
  }

  private _safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  private _parseExpiration(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) return 7 * 24 * 60 * 60;

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

    return value * multipliers[unit];
  }
}
