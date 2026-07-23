import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  BoardDetails,
  boardDetailsSelect,
} from "../presentation/selects/board-details.select";
import { BoardAccessService } from "../services/board-access.service";

export type UpdateBoardInput = {
  boardId: string;
  currentUserId: string;
  name?: string;
  description?: string | null;
};

@Injectable()
export class UpdateBoardUseCase implements UseCase<
  UpdateBoardInput,
  BoardDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}

  async execute({
    boardId,
    currentUserId,
    name,
    description,
  }: UpdateBoardInput): Promise<BoardDetails> {
    await this.access.requireActiveAdmin(boardId, currentUserId);
    const data: Prisma.BoardUpdateInput = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) {
      data.description = description === null ? null : description.trim();
    }
    return this.prisma.board.update({
      where: { id: boardId },
      data,
      select: boardDetailsSelect,
    });
  }
}
