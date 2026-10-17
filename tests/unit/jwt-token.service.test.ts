import crypto from 'crypto';
import { describe, expect, it } from 'vitest';

import { JwtTokenService } from '@/infrastructure/services/JwtTokenService';
import { AppError } from '@/shared/errors/AppError';

const SECRET = 'unit-test-secret';

function encode(value: unknown): string {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(raw).toString('base64url');
}

/** Builds a token with a *valid* signature so only the parsing/claims are tested. */
function rawToken(header: unknown, body: unknown, secret = SECRET): string {
  const encodedHeader = encode(header);
  const encodedBody = encode(body);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function expectCode(fn: () => unknown, code: string): void {
  try {
    fn();
    throw new Error('expected verify() to throw');
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(code);
  }
}

const nowInSeconds = (): number => Math.floor(Date.now() / 1000);

describe('JwtTokenService', () => {
  const service = new JwtTokenService({ secret: SECRET, expiresIn: '1h' });

  it('signs a token that verifies back', () => {
    const token = service.sign({ sub: 'user-1' });
    const payload = service.verify(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.exp as number).toBeGreaterThan(payload.iat as number);
  });

  it('rejects a token with a tampered signature', () => {
    const [header, body] = service.sign({ sub: 'user-1' }).split('.');
    expectCode(() => service.verify(`${header}.${body}.deadbeef`), 'auth.invalidToken');
  });

  it('rejects a token signed with another secret', () => {
    expectCode(
      () => service.verify(rawToken({ alg: 'HS256' }, { sub: 'x' }, 'other-secret')),
      'auth.invalidToken'
    );
  });

  it('rejects a token with fewer than three parts', () => {
    expectCode(() => service.verify('not-a-token'), 'auth.invalidToken');
  });

  it('rejects a non-JSON payload instead of leaking a SyntaxError', () => {
    expectCode(() => service.verify(rawToken({ alg: 'HS256' }, 'not-json')), 'auth.invalidToken');
  });

  it('rejects a token whose header alg is not HS256', () => {
    expectCode(() => service.verify(rawToken({ alg: 'none' }, { sub: 'x' })), 'auth.invalidToken');
  });

  it('rejects a token without a subject', () => {
    expectCode(
      () => service.verify(rawToken({ alg: 'HS256' }, { iat: nowInSeconds() })),
      'auth.invalidToken'
    );
  });

  it('rejects an expired token', () => {
    const expired = { sub: 'x', iat: nowInSeconds() - 120, exp: nowInSeconds() - 60 };
    expectCode(() => service.verify(rawToken({ alg: 'HS256' }, expired)), 'auth.expired');
  });
});
