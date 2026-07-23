import type {
  BoardColumnListItem,
  CreateBoardColumnInput,
  DeleteBoardColumnInput,
  ReorderBoardColumnsInput,
  UpdateBoardColumnInput,
} from "@/features/board-columns/types/board-column.types";
import { api } from "@/lib/axios";

const columnsPath = (boardId: string) => `/boards/${encodeURIComponent(boardId)}/columns`;

export async function listBoardColumns(boardId: string): Promise<BoardColumnListItem[]> {
  return (await api.get<BoardColumnListItem[]>(columnsPath(boardId))).data;
}

export async function createBoardColumn({
  boardId,
  name,
}: CreateBoardColumnInput): Promise<BoardColumnListItem> {
  return (await api.post<BoardColumnListItem>(columnsPath(boardId), { name })).data;
}

export async function updateBoardColumn({
  boardId,
  columnId,
  name,
}: UpdateBoardColumnInput): Promise<BoardColumnListItem> {
  return (
    await api.patch<BoardColumnListItem>(
      `${columnsPath(boardId)}/${encodeURIComponent(columnId)}`,
      { name },
    )
  ).data;
}

export async function reorderBoardColumns(
  input: ReorderBoardColumnsInput,
): Promise<BoardColumnListItem[]> {
  return (
    await api.patch<BoardColumnListItem[]>(`${columnsPath(input.boardId)}/reorder`, {
      columns: input.columns,
    })
  ).data;
}

export async function deleteBoardColumn({
  boardId,
  columnId,
}: DeleteBoardColumnInput): Promise<void> {
  await api.delete(`${columnsPath(boardId)}/${encodeURIComponent(columnId)}`);
}
