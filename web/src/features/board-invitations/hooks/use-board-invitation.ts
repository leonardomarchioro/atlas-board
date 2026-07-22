"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoardInvitation } from "@/features/board-invitations/api/get-board-invitation";
import { boardInvitationKeys } from "@/features/board-invitations/queries/board-invitation.keys";

export function useBoardInvitation(token: string) {
  return useQuery({
    queryKey: boardInvitationKeys.detail(token),
    queryFn: () => getBoardInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });
}
