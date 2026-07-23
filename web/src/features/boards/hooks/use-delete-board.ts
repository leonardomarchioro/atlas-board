"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteBoard } from "@/features/boards/api/delete-board";
import { boardKeys } from "@/features/boards/board-keys";
import { taskKeys } from "@/features/tasks/task-keys";
import type { TaskDetails } from "@/features/tasks/types/task.types";

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: async (_, boardId) => {
      const taskDetails = queryClient.getQueriesData<TaskDetails>({
        queryKey: taskKeys.details(),
      });
      taskDetails.forEach(([queryKey, task]) => {
        if (task?.boardId === boardId) {
          queryClient.removeQueries({ queryKey, exact: true });
        }
      });
      queryClient.removeQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.removeQueries({ queryKey: taskKeys.board(boardId) });
      queryClient.removeQueries({ queryKey: taskKeys.tags(boardId) });
      await queryClient.invalidateQueries({ queryKey: boardKeys.userBoards() });
      toast.success("Board excluído com sucesso.");
    },
  });
}
