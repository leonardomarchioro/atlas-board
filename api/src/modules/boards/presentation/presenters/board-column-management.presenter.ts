import type { BoardColumnView } from "../selects/board-column.select";

export class BoardColumnManagementPresenter {
  static toHTTP(column: BoardColumnView) {
    return {
      id: column.id,
      boardId: column.boardId,
      name: column.name,
      position: column.position,
      tasksCount: column._count.tasks,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
    };
  }
}
