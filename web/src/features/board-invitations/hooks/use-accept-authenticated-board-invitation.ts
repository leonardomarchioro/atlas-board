"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptAuthenticatedBoardInvitation } from "@/features/board-invitations/api/accept-authenticated-board-invitation";
import { boardInvitationKeys } from "@/features/board-invitations/queries/board-invitation.keys";
import { boardKeys } from "@/features/boards/board-keys";
import { notificationKeys } from "@/features/notifications/notification.keys";

export function useAcceptAuthenticatedBoardInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      acceptAuthenticatedBoardInvitation(invitationId),
    onSuccess: async (result, invitationId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: boardKeys.all }),
        queryClient.invalidateQueries({
          queryKey: boardInvitationKeys.authenticatedDetail(invitationId),
        }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
        queryClient.invalidateQueries({
          queryKey: boardKeys.detail(result.board.id),
        }),
        queryClient.invalidateQueries({
          queryKey: boardKeys.members(result.board.id),
        }),
      ]);
    },
  });
}
