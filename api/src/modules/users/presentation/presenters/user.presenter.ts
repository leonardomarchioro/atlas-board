import type { PublicUser } from "../../application/select/user-public-fields";

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserPresenter {
  static toHTTP(user: PublicUser): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
