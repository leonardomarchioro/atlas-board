import { api } from "@/lib/axios";

export interface DeleteBoardTagInput {
  boardId: string;
  tagId: string;
}

export async function deleteBoardTag({ boardId, tagId }: DeleteBoardTagInput): Promise<void> {
  await api.delete(`/boards/${encodeURIComponent(boardId)}/tags/${encodeURIComponent(tagId)}`);
}
