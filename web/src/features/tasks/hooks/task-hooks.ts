"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTask } from "@/features/tasks/api/create-task";
import { getTask } from "@/features/tasks/api/get-task";
import { listBoardTags } from "@/features/tasks/api/list-board-tags";
import { listBoardTasks } from "@/features/tasks/api/list-board-tasks";
import { moveTask } from "@/features/tasks/api/move-task";
import {
  addChecklistItem,
  createTaskComment,
  deleteChecklistItem,
  deleteTask,
  deleteTaskComment,
  listTaskComments,
  updateChecklistItem,
  updateTask,
  updateTaskComment,
} from "@/features/tasks/api/task-mutations";
import { taskKeys } from "@/features/tasks/task-keys";
import { boardKeys } from "@/features/boards/board-keys";
import type {
  BoardTask,
  CreateTaskInput,
  MoveTaskInput,
  TaskComment,
  TaskDetails,
} from "@/features/tasks/types/task.types";
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

export function useTaskComments(taskId: string | null) {
  return useQuery({
    queryKey: taskKeys.comments(taskId ?? ""),
    queryFn: () => listTaskComments(taskId ?? ""),
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
      await queryClient.invalidateQueries({ queryKey: boardKeys.userBoards() });
      toast.success("Tarefa criada com sucesso.");
    },
  });
}

function replaceTaskSummary(tasks: BoardTask[] | undefined, details: TaskDetails) {
  if (!tasks) return tasks;
  return tasks.map((task) =>
    task.id === details.id
      ? {
          ...task,
          ...details,
          sharedUsers: details.sharedWith,
          checklistCount: details.checklistProgress.total,
          completedChecklistCount: details.checklistProgress.completed,
        }
      : task,
  );
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onMutate: async (input) => {
      const detailKey = taskKeys.detail(input.taskId);
      const boardKey = taskKeys.board(input.boardId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries({ queryKey: boardKey }),
      ]);
      const previousDetail = queryClient.getQueryData<TaskDetails>(detailKey);
      const previousBoard = queryClient.getQueryData<BoardTask[]>(boardKey);
      if (previousDetail) {
        queryClient.setQueryData<TaskDetails>(detailKey, { ...previousDetail, ...input });
      }
      queryClient.setQueryData<BoardTask[]>(boardKey, (tasks) =>
        tasks?.map((task) => (task.id === input.taskId ? { ...task, ...input } : task)),
      );
      return { previousDetail, previousBoard, detailKey, boardKey };
    },
    onSuccess: (details, _, context) => {
      queryClient.setQueryData(context.detailKey, details);
      queryClient.setQueryData<BoardTask[]>(context.boardKey, (tasks) =>
        replaceTaskSummary(tasks, details),
      );
    },
    onError: (_, __, context) => {
      if (context?.previousDetail) queryClient.setQueryData(context.detailKey, context.previousDetail);
      if (context?.previousBoard) queryClient.setQueryData(context.boardKey, context.previousBoard);
      toast.error("Não foi possível salvar a alteração.");
    },
    onSettled: async (_, __, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(input.taskId) }),
        queryClient.invalidateQueries({ queryKey: taskKeys.board(input.boardId) }),
      ]);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; boardId: string }) => deleteTask(taskId),
    onSuccess: async (_, input) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(input.taskId) });
      await queryClient.invalidateQueries({ queryKey: taskKeys.board(input.boardId) });
      await queryClient.invalidateQueries({ queryKey: boardKeys.userBoards() });
      toast.success("Tarefa excluída com sucesso.");
    },
  });
}

function detailsMutation(
  mutationFn: (input: {
    taskId: string;
    boardId: string;
    itemId?: string;
    title?: string;
    isCompleted?: boolean;
  }) => Promise<TaskDetails>,
) {
  return function useDetailsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn,
      onSuccess: (details, input) => {
        queryClient.setQueryData(taskKeys.detail(input.taskId), details);
        queryClient.setQueryData<BoardTask[]>(taskKeys.board(input.boardId), (tasks) =>
          replaceTaskSummary(tasks, details),
        );
      },
      onError: () => toast.error("Não foi possível atualizar o checklist."),
    });
  };
}

export const useCreateChecklistItem = detailsMutation(({ taskId, title = "" }) =>
  addChecklistItem(taskId, title),
);
export const useUpdateChecklistItem = detailsMutation(
  ({ taskId, itemId = "", title, isCompleted }) =>
    updateChecklistItem(taskId, itemId, { title, isCompleted }),
);
export const useDeleteChecklistItem = detailsMutation(({ taskId, itemId = "" }) =>
  deleteChecklistItem(taskId, itemId),
);

export function useCreateTaskComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; boardId: string; content: string }) =>
      createTaskComment(taskId, content),
    onSuccess: (comment, input) => {
      queryClient.setQueryData<TaskComment[]>(taskKeys.comments(input.taskId), (items = []) => [
        ...items,
        comment,
      ]);
      void queryClient.invalidateQueries({ queryKey: taskKeys.board(input.boardId) });
    },
    onError: () => toast.error("Não foi possível publicar o comentário."),
  });
}

export function useUpdateTaskComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { taskId: string; commentId: string; content: string }) =>
      updateTaskComment(input.taskId, input.commentId, input.content),
    onSuccess: (comment, input) =>
      queryClient.setQueryData<TaskComment[]>(taskKeys.comments(input.taskId), (items = []) =>
        items.map((item) => (item.id === comment.id ? comment : item)),
      ),
    onError: () => toast.error("Não foi possível editar o comentário."),
  });
}

export function useDeleteTaskComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { taskId: string; boardId: string; commentId: string }) =>
      deleteTaskComment(input.taskId, input.commentId),
    onSuccess: (_, input) => {
      queryClient.setQueryData<TaskComment[]>(taskKeys.comments(input.taskId), (items = []) =>
        items.filter((item) => item.id !== input.commentId),
      );
      void queryClient.invalidateQueries({ queryKey: taskKeys.board(input.boardId) });
    },
    onError: () => toast.error("Não foi possível excluir o comentário."),
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
    onSuccess: (details) => {
      queryClient.setQueryData(taskKeys.detail(details.id), details);
    },
    onSettled: async (_, __, input) => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.board(input.boardId) });
    },
  });
}
