export const boardInvitationKeys = {
  all: ["board-invitations"] as const,
  detail: (token: string) => [...boardInvitationKeys.all, "detail", token] as const,
};
