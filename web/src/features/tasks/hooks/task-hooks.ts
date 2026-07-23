"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTask } from "@/features/tasks/api/create-task";
import { getTask } from "@/features/tasks/api/get-task";
import { listBoardTags } from "@/features/tasks/api/list-board-tags";
import { listBoardTasks } from "@/features/tasks/api/list-board-tasks";
import { moveTask } from "@/features/tasks/api/move-task";
import { taskKeys } from "@/features/tasks/task-keys";
import type { BoardTask, CreateTaskInput, MoveTaskInput } from "@/features/tasks/types/task.types";
import { moveTaskInCache } from "@/features/tasks/utils/move-task-in-cache";

export function useBoardTasks(boardId: string) {
  return useQuery({
    queryKey: taskKeys.board(boardId),
    queryFn: () => listBoardTasks(boardId),
    enabled: Boolean(boardId),
    retry: false,
  });
}

export function useBoardTags(boardId: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.tags(boardId),
    queryFn: () => listBoardTags(boardId),
    enabled: Boolean(boardId) && enabled,
  });
}

export function useTaskDetails(taskId: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(taskId ?? ""),
    queryFn: () => getTask(taskId ?? ""),
    enabled: Boolean(taskId),
    retry: false,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.board(task.boardId) });
      toast.success("Tarefa criada com sucesso.");
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MoveTaskInput) => moveTask(input),
    onMutate: async (input) => {
      const queryKey = taskKeys.board(input.boardId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<BoardTask[]>(queryKey);
      queryClient.setQueryData<BoardTask[]>(queryKey, (current = []) =>
        moveTaskInCache(current, input),
      );
      return { previous, queryKey };
    },
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous);
      toast.error("Não foi possível mover a tarefa. A posição anterior foi restaurada.");
    },
    onSettled: async (_, __, input) => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.board(input.boardId) });
    },
  });
}
