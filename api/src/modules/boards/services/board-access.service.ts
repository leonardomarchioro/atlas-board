import { Injectable } from "@nestjs/common";
import type { BoardRole } from "@prisma/client";

import { PrismaService } from "@shared/database/prisma.service";
import { BoardAccessDeniedError } from "../errors/board-access-denied.error";
import { BoardNotFoundError } from "../errors/board-not-found.error";

export type ActiveBoardMember = { id: string; role: BoardRole };

@Injectable()
export class BoardAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async requireActiveMember(
    boardId: string,
    userId: string,
  ): Promise<ActiveBoardMember> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true },
    });
    if (!board) throw new BoardNotFoundError();

    const member = await this.prisma.boardMember.findFirst({
      where: { boardId, userId, status: "ACTIVE" },
      select: { id: true, role: true },
    });
    if (!member) throw new BoardAccessDeniedError();
    return member;
  }

  async requireActiveAdmin(
    boardId: string,
    userId: string,
  ): Promise<ActiveBoardMember> {
    const member = await this.requireActiveMember(boardId, userId);
    if (member.role !== "ADMIN") throw new BoardAccessDeniedError();
    return member;
  }
}
