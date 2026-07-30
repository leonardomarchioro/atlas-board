export const boardInvitationKeys = {
  all: ["board-invitations"] as const,
  detail: (token: string) => [...boardInvitationKeys.all, "detail", token] as const,
  authenticatedDetail: (invitationId: string) =>
    [...boardInvitationKeys.all, "authenticated-detail", invitationId] as const,
};
