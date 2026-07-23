import type { BoardDetails } from "@/features/boards/types/board.types";
import { api } from "@/lib/axios";

export async function getBoardDetails(boardId: string): Promise<BoardDetails> {
  const response = await api.get<BoardDetails>(`/boards/${encodeURIComponent(boardId)}`);
  return response.data;
}
