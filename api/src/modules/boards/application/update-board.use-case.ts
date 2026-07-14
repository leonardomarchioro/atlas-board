import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { BoardColumnNotFoundError } from "../errors/board-column-not-found.error";
import { BoardMustHaveColumnError } from "../errors/board-must-have-column.error";
import {
  BoardDetails,
  boardDetailsSelect,
} from "../presentation/selects/board-details.select";
import { BoardAccessService } from "../services/board-access.service";

export type UpdateBoardInput = {
  boardId: string;
  currentUserId: string;
  name?: string;
  description?: string;
  column?: Array<{ id?: string; name: string }>;
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
    column,
  }: UpdateBoardInput): Promise<BoardDetails> {
    await this.access.requireActiveAdmin(boardId, currentUserId);
    if (column?.length === 0) throw new BoardMustHaveColumnError();

    return this.prisma.$transaction(async (tx) => {
      const data: Prisma.BoardUpdateInput = {};
      if (name !== undefined) data.name = name.trim();
      if (description !== undefined) data.description = description.trim();

      if (column !== undefined) {
        const currentColumns = await tx.boardColumn.findMany({
          where: { boardId },
          select: { id: true },
        });
        const currentIds = new Set(currentColumns.map(({ id }) => id));
        const informedIds = column.flatMap(({ id }) => (id ? [id] : []));
        if (
          new Set(informedIds).size !== informedIds.length ||
          informedIds.some((id) => !currentIds.has(id))
        )
          throw new BoardColumnNotFoundError();

        await tx.boardColumn.deleteMany({
          where: { boardId, id: { notIn: informedIds } },
        });
        await tx.boardColumn.updateMany({
          where: { boardId },
          data: {
            position: { increment: currentColumns.length + column.length },
          },
        });
        for (const [position, item] of column.entries()) {
          if (item.id) {
            await tx.boardColumn.update({
              where: { id: item.id },
              data: { name: item.name.trim(), position },
            });
          } else {
            await tx.boardColumn.create({
              data: { boardId, name: item.name.trim(), position },
            });
          }
        }
      }

      return tx.board.update({
        where: { id: boardId },
        data,
        select: boardDetailsSelect,
      });
    });
  }
}
