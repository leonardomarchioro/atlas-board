import { PublicUser } from "@modules/users/application/select/user-public-fields";
import {
  UserPresenter,
  UserResponse,
} from "@modules/users/presentation/presenters/user.presenter";

type PresentableAuth = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
};

export class AuthPresenter {
  static toHTTP(auth: PresentableAuth): AuthResponse {
    return {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: UserPresenter.toHTTP(auth.user),
    };
  }
}
