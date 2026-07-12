import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";

import { AuthenticateUserUseCase } from "../application/authenticate-user.use-case";
import { LogoutUserUseCase } from "../application/logout-user.use-case";
import { RefreshSessionUseCase } from "../application/refresh-session.use-case";
import { RegisterUserUseCase } from "../application/register-user.use-case";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { AuthPresenter, AuthResponse } from "./presenters/auth.presenter";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
  ) {}

  @Post("register")
  async register(@Body() body: RegisterUserDto): Promise<AuthResponse> {
    const auth = await this.registerUserUseCase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    return AuthPresenter.toHTTP(auth);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto): Promise<AuthResponse> {
    const auth = await this.authenticateUserUseCase.execute({
      email: body.email,
      password: body.password,
    });

    return AuthPresenter.toHTTP(auth);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthResponse> {
    const auth = await this.refreshSessionUseCase.execute({
      refreshToken: body.refreshToken,
    });

    return AuthPresenter.toHTTP(auth);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() body: RefreshTokenDto): Promise<void> {
    await this.logoutUserUseCase.execute({
      refreshToken: body.refreshToken,
    });
  }
}
