import { authApi } from "@/lib/axios";
import type { BoardInvitationResponse } from "@/features/board-invitations/types/board-invitation.types";

export async function getBoardInvitation(token: string): Promise<BoardInvitationResponse> {
  const response = await authApi.get<BoardInvitationResponse>(
    `/board-invitations/${encodeURIComponent(token)}`,
  );
  return response.data;
}
