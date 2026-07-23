"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBoardColumn,
  deleteBoardColumn,
  listBoardColumns,
  reorderBoardColumns,
  updateBoardColumn,
} from "@/features/board-columns/api/board-columns-api";
import type {
  BoardColumnListItem,
  CreateBoardColumnInput,
  DeleteBoardColumnInput,
  ReorderBoardColumnsInput,
  UpdateBoardColumnInput,
} from "@/features/board-columns/types/board-column.types";
import { boardKeys } from "@/features/boards/board-keys";
import type { BoardDetails } from "@/features/boards/types/board.types";

async function invalidateColumnData(
  queryClient: ReturnType<typeof useQueryClient>,
  boardId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: boardKeys.columns(boardId) }),
    queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  ]);
}

export function useBoardColumns(boardId: string, enabled = true) {
  return useQuery({
    queryKey: boardKeys.columns(boardId),
    queryFn: () => listBoardColumns(boardId),
    enabled: Boolean(boardId) && enabled,
    retry: false,
  });
}

export function useCreateBoardColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBoardColumnInput) => createBoardColumn(input),
    onSuccess: async (_, input) => {
      await invalidateColumnData(queryClient, input.boardId);
      toast.success("Coluna criada com sucesso.");
    },
  });
}

export function useUpdateBoardColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBoardColumnInput) => updateBoardColumn(input),
    onSuccess: async (_, input) => {
      await invalidateColumnData(queryClient, input.boardId);
      toast.success("Coluna atualizada com sucesso.");
    },
  });
}

export function useReorderBoardColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderBoardColumnsInput) => reorderBoardColumns(input),
    onMutate: async (input) => {
      const columnsKey = boardKeys.columns(input.boardId);
      const detailKey = boardKeys.detail(input.boardId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: columnsKey }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ]);
      const previousColumns = queryClient.getQueryData<BoardColumnListItem[]>(columnsKey);
      const previousDetail = queryClient.getQueryData<BoardDetails>(detailKey);
      const positions = new Map(input.columns.map((column) => [column.id, column.position]));
      queryClient.setQueryData<BoardColumnListItem[]>(columnsKey, (current) =>
        current
          ? current
              .map((column) => ({
                ...column,
                position: positions.get(column.id) ?? column.position,
              }))
              .sort((a, b) => a.position - b.position)
          : current,
      );
      queryClient.setQueryData<BoardDetails>(detailKey, (current) =>
        current
          ? {
              ...current,
              columns: current.columns
                .map((column) => ({
                  ...column,
                  position: positions.get(column.id) ?? column.position,
                }))
                .sort((a, b) => a.position - b.position),
            }
          : current,
      );
      return { previousColumns, previousDetail, columnsKey, detailKey };
    },
    onError: (_, __, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(context.columnsKey, context.previousColumns);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(context.detailKey, context.previousDetail);
      }
      toast.error("Não foi possível reordenar as colunas. A ordem anterior foi restaurada.");
    },
    onSettled: async (_, __, input) => {
      await invalidateColumnData(queryClient, input.boardId);
    },
  });
}

export function useDeleteBoardColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteBoardColumnInput) => deleteBoardColumn(input),
    onSuccess: async (_, input) => {
      await invalidateColumnData(queryClient, input.boardId);
      toast.success("Coluna excluída com sucesso.");
    },
  });
}
