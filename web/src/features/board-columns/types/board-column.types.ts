export interface BoardColumnListItem {
  id: string;
  boardId: string;
  name: string;
  position: number;
  tasksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardColumnInput {
  boardId: string;
  name: string;
}

export interface UpdateBoardColumnInput extends CreateBoardColumnInput {
  columnId: string;
}

export interface ReorderBoardColumnsInput {
  boardId: string;
  columns: Array<{ id: string; position: number }>;
}

export interface DeleteBoardColumnInput {
  boardId: string;
  columnId: string;
}
