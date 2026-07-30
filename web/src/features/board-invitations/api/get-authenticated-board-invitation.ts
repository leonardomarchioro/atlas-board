import type { AuthenticatedBoardInvitationResponse } from "@/features/board-invitations/types/board-invitation.types";
import { api } from "@/lib/axios";

export async function getAuthenticatedBoardInvitation(
  invitationId: string,
): Promise<AuthenticatedBoardInvitationResponse> {
  return (
    await api.get<AuthenticatedBoardInvitationResponse>(
      `/board-invitations/${encodeURIComponent(invitationId)}/authenticated`,
    )
  ).data;
}
