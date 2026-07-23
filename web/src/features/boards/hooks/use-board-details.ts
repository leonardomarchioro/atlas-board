"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoardDetails } from "@/features/boards/api/get-board-details";
import { boardKeys } from "@/features/boards/board-keys";

export function useBoardDetails(boardId: string) {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => getBoardDetails(boardId),
    enabled: Boolean(boardId),
    retry: false,
  });
}
