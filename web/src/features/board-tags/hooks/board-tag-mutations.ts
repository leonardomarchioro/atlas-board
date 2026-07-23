"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBoardTag,
  type CreateBoardTagInput,
} from "@/features/board-tags/api/create-board-tag";
import {
  deleteBoardTag,
  type DeleteBoardTagInput,
} from "@/features/board-tags/api/delete-board-tag";
import {
  updateBoardTag,
  type UpdateBoardTagInput,
} from "@/features/board-tags/api/update-board-tag";
import { taskKeys } from "@/features/tasks/task-keys";

async function invalidateTagData(queryClient: ReturnType<typeof useQueryClient>, boardId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: taskKeys.tags(boardId) }),
    queryClient.invalidateQueries({ queryKey: taskKeys.board(boardId) }),
    queryClient.invalidateQueries({ queryKey: taskKeys.details() }),
  ]);
}

export function useCreateBoardTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBoardTagInput) => createBoardTag(input),
    onSuccess: async (_, input) => {
      await invalidateTagData(queryClient, input.boardId);
      toast.success("Tag criada com sucesso.");
    },
  });
}

export function useUpdateBoardTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBoardTagInput) => updateBoardTag(input),
    onSuccess: async (_, input) => {
      await invalidateTagData(queryClient, input.boardId);
      toast.success("Tag atualizada com sucesso.");
    },
  });
}

export function useDeleteBoardTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteBoardTagInput) => deleteBoardTag(input),
    onSuccess: async (_, input) => {
      await invalidateTagData(queryClient, input.boardId);
      toast.success("Tag excluída com sucesso.");
    },
  });
}
