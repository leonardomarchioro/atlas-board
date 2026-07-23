import type { BoardRole } from "@prisma/client";
import type { BoardDetails } from "../selects/board-details.select";
import type { BoardSummary } from "../selects/board-summary.select";
import { BoardColumnPresenter } from "./board-column.presenter";

export class BoardPresenter {
  static toSummary(board: BoardSummary, userId: string) {
    const membership = board.members.find(
      (member) => member.userId === userId && member.status === "ACTIVE",
    );
    return {
      id: board.id,
      name: board.name,
      description: board.description,
      role: membership?.role as BoardRole,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }

  static toDetails(board: BoardDetails, role: BoardRole) {
    return {
      id: board.id,
      name: board.name,
      description: board.description,
      role,
      createdBy: board.createdBy,
      members: board.members.flatMap((member) =>
        member.user
          ? [{ id: member.id, role: member.role, user: member.user }]
          : [],
      ),
      columns: board.columns.map(BoardColumnPresenter.toHTTP),
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
