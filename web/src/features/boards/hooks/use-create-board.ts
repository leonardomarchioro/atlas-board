"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBoard } from "@/features/boards/api/create-board";
import { boardKeys } from "@/features/boards/board-keys";
import type { CreateBoardInput } from "@/features/boards/types/create-board.types";

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardInput) => createBoard(input),
    onSuccess: async (board) => {
      queryClient.setQueryData(boardKeys.detail(board.id), board);
      await queryClient.invalidateQueries({ queryKey: boardKeys.userBoards() });
      toast.success("Board criado com sucesso.");
    },
  });
}
