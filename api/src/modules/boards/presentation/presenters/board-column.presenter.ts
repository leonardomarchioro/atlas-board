import type { BoardDetails } from "../selects/board-details.select";

type BoardColumn = BoardDetails["columns"][number];

export class BoardColumnPresenter {
  static toHTTP(column: BoardColumn) {
    return {
      id: column.id,
      name: column.name,
      position: column.position,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
    };
  }
}
