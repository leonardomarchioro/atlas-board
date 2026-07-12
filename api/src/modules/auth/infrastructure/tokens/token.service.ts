export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

export abstract class TokenService {
  abstract generateAccessToken(payload: AccessTokenPayload): Promise<string>;

  abstract generateRefreshToken(payload: RefreshTokenPayload): Promise<string>;

  abstract verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
}
