import type { BoardDetails, UpdateBoardInput } from "@/features/boards/types/board.types";
import { api } from "@/lib/axios";

export async function updateBoard({ boardId, ...input }: UpdateBoardInput): Promise<BoardDetails> {
  const response = await api.patch<BoardDetails>(`/boards/${encodeURIComponent(boardId)}`, input);
  return response.data;
}
