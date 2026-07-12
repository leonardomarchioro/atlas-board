import type { Prisma } from "@prisma/client";

export const userAuthFields = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type AuthUser = Prisma.UserGetPayload<{
  select: typeof userAuthFields;
}>;
