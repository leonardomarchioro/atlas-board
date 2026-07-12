import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";

import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenService,
} from "./token.service";

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.getExpiresIn("JWT_ACCESS_EXPIRES_IN"),
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.getExpiresIn("JWT_REFRESH_EXPIRES_IN"),
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
    });
  }

  private getExpiresIn(key: string): JwtSignOptions["expiresIn"] {
    return this.configService.getOrThrow<string>(
      key,
    ) as JwtSignOptions["expiresIn"];
  }
}
