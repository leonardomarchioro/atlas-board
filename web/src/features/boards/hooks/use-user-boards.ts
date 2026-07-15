"use client";

import { useQuery } from "@tanstack/react-query";

import { listUserBoards } from "@/features/boards/api/list-user-boards";
import { boardKeys } from "@/features/boards/board-keys";

export function useUserBoards() {
  return useQuery({
    queryKey: boardKeys.userBoards(),
    queryFn: listUserBoards,
    staleTime: 60_000,
  });
}
