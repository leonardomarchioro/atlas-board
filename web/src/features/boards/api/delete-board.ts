import { api } from "@/lib/axios";

export async function deleteBoard(boardId: string): Promise<void> {
  await api.delete(`/boards/${encodeURIComponent(boardId)}`);
}
