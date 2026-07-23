"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  inviteBoardMember,
  listBoardMembers,
  removeBoardMember,
} from "@/features/board-members/api/board-members-api";
import type {
  InviteBoardMemberInput,
  RemoveBoardMemberInput,
} from "@/features/board-members/types/board-member.types";
import { boardKeys } from "@/features/boards/board-keys";

async function invalidateMemberData(
  queryClient: ReturnType<typeof useQueryClient>,
  boardId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: boardKeys.members(boardId) }),
    queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
    queryClient.invalidateQueries({ queryKey: boardKeys.userBoards() }),
  ]);
}

export function useBoardMembers(boardId: string, enabled: boolean) {
  return useQuery({
    queryKey: boardKeys.members(boardId),
    queryFn: () => listBoardMembers(boardId),
    enabled: Boolean(boardId) && enabled,
    retry: false,
  });
}

export function useInviteBoardMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteBoardMemberInput) => inviteBoardMember(input),
    onSuccess: async (_, input) => {
      await invalidateMemberData(queryClient, input.boardId);
      toast.success("Convite criado com sucesso.");
    },
  });
}

export function useRemoveBoardMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RemoveBoardMemberInput) => removeBoardMember(input),
    onSuccess: async (_, input) => {
      await invalidateMemberData(queryClient, input.boardId);
      toast.success("Membro removido com sucesso.");
    },
  });
}
