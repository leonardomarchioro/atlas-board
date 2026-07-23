import { Injectable } from "@nestjs/common";
import type { BoardRole } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  BoardSummary,
  boardSummarySelect,
} from "../presentation/selects/board-summary.select";

export type ListUserBoardsInput = { userId: string };
export type UserBoardSummary = { board: BoardSummary; role: BoardRole };

@Injectable()
export class ListUserBoardsUseCase implements UseCase<
  ListUserBoardsInput,
  UserBoardSummary[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId }: ListUserBoardsInput): Promise<UserBoardSummary[]> {
    const boards = await this.prisma.board.findMany({
      where: { members: { some: { userId, status: "ACTIVE" } } },
      select: boardSummarySelect,
      orderBy: { updatedAt: "desc" },
    });
    const memberships = await this.prisma.boardMember.findMany({
      where: {
        userId,
        status: "ACTIVE",
        boardId: { in: boards.map((board) => board.id) },
      },
      select: { boardId: true, role: true },
    });
    const roles = new Map(
      memberships.map((membership) => [membership.boardId, membership.role]),
    );

    return boards.flatMap((board) => {
      const role = roles.get(board.id);
      return role ? [{ board, role }] : [];
    });
  }
}
