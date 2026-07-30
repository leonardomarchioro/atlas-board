import type { AcceptBoardInvitationResponse } from "@/features/board-invitations/types/board-invitation.types";
import { api } from "@/lib/axios";

export async function acceptAuthenticatedBoardInvitation(
  invitationId: string,
): Promise<AcceptBoardInvitationResponse> {
  return (
    await api.post<AcceptBoardInvitationResponse>(
      `/board-invitations/${encodeURIComponent(invitationId)}/accept-authenticated`,
    )
  ).data;
}
