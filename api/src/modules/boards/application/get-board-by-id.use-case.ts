import { Injectable } from "@nestjs/common";
import type { BoardRole } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { BoardNotFoundError } from "../errors/board-not-found.error";
import {
  BoardDetails,
  boardDetailsSelect,
} from "../presentation/selects/board-details.select";
import { BoardAccessService } from "../services/board-access.service";

export type GetBoardByIdInput = { boardId: string; currentUserId: string };
export type BoardWithCurrentRole = { board: BoardDetails; role: BoardRole };

@Injectable()
export class GetBoardByIdUseCase implements UseCase<
  GetBoardByIdInput,
  BoardWithCurrentRole
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}
  async execute({
    boardId,
    currentUserId,
  }: GetBoardByIdInput): Promise<BoardWithCurrentRole> {
    const member = await this.access.requireActiveMember(
      boardId,
      currentUserId,
    );
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: boardDetailsSelect,
    });
    if (!board) throw new BoardNotFoundError();
    return { board, role: member.role };
  }
}
