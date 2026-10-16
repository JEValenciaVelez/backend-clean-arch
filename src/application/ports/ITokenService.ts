export interface ITokenPayload {
  sub: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Port for issuing/verifying auth tokens. Implemented in infrastructure (JWT).
 */
export interface ITokenService {
  sign(payload: ITokenPayload): string;
  verify(token: string): ITokenPayload;
}
