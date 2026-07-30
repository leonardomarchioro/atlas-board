"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthenticatedBoardInvitation } from "@/features/board-invitations/api/get-authenticated-board-invitation";
import { boardInvitationKeys } from "@/features/board-invitations/queries/board-invitation.keys";

export function useAuthenticatedBoardInvitation(invitationId: string) {
  return useQuery({
    queryKey: boardInvitationKeys.authenticatedDetail(invitationId),
    queryFn: () => getAuthenticatedBoardInvitation(invitationId),
    enabled: Boolean(invitationId),
    retry: false,
  });
}
