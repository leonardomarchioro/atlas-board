import type { BoardSummary } from "@/features/boards/types/board.types";
import { api } from "@/lib/axios";

export async function listUserBoards(): Promise<BoardSummary[]> {
  const response = await api.get<BoardSummary[]>("/boards");
  return response.data;
}
