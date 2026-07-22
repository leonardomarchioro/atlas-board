"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptBoardInvitation } from "@/features/board-invitations/api/accept-board-invitation";
import { boardInvitationKeys } from "@/features/board-invitations/queries/board-invitation.keys";
import { boardKeys } from "@/features/boards/board-keys";

export function useAcceptBoardInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptBoardInvitation(token),
    onSuccess: async (_, token) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: boardKeys.all }),
        queryClient.invalidateQueries({
          queryKey: boardInvitationKeys.detail(token),
          refetchType: "none",
        }),
      ]);
    },
  });
}
