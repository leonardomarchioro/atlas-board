import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { UsersModule } from "@modules/users/users.module";
import { JwtStrategy } from "@shared/auth/jwt.strategy";

import { AuthenticateUserUseCase } from "./application/authenticate-user.use-case";
import { GetAuthenticatedUserUseCase } from "./application/get-authenticated-user.use-case";
import { LogoutUserUseCase } from "./application/logout-user.use-case";
import { RefreshSessionUseCase } from "./application/refresh-session.use-case";
import { RegisterUserUseCase } from "./application/register-user.use-case";
import { BcryptHashService } from "./infrastructure/hashing/bcrypt-hash.service";
import { HashService } from "./infrastructure/hashing/hash.service";
import { JwtTokenService } from "./infrastructure/tokens/jwt-token.service";
import { TokenService } from "./infrastructure/tokens/token.service";
import { AuthController } from "./presentation/auth.controller";

@Module({
  imports: [JwtModule.register({}), PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    RefreshSessionUseCase,
    LogoutUserUseCase,
    GetAuthenticatedUserUseCase,
    JwtStrategy,
    {
      provide: HashService,
      useClass: BcryptHashService,
    },
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
})
export class AuthModule {}
