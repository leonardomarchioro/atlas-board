import { api } from "@/lib/axios";
import type { AcceptBoardInvitationResponse } from "@/features/board-invitations/types/board-invitation.types";

export async function acceptBoardInvitation(token: string): Promise<AcceptBoardInvitationResponse> {
  const response = await api.post<AcceptBoardInvitationResponse>(
    `/board-invitations/${encodeURIComponent(token)}/accept`,
  );
  return response.data;
}
