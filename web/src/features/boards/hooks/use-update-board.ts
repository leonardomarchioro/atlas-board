"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateBoard } from "@/features/boards/api/update-board";
import { boardKeys } from "@/features/boards/board-keys";
import type { UpdateBoardInput } from "@/features/boards/types/board.types";

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBoardInput) => updateBoard(input),
    onSuccess: async (board) => {
      queryClient.setQueryData(boardKeys.detail(board.id), board);
      await queryClient.invalidateQueries({
        queryKey: boardKeys.userBoards(),
      });
      toast.success("Board atualizado com sucesso.");
    },
  });
}
