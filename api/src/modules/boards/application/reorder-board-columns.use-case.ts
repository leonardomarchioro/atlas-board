import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { InvalidBoardColumnOrderError } from "../errors/invalid-board-column-order.error";
import {
  type BoardColumnView,
  boardColumnSelect,
} from "../presentation/selects/board-column.select";
import { BoardAccessService } from "../services/board-access.service";

export interface ReorderBoardColumnsInput {
  boardId: string;
  currentUserId: string;
  columns: Array<{ id: string; position: number }>;
}

@Injectable()
export class ReorderBoardColumnsUseCase implements UseCase<
  ReorderBoardColumnsInput,
  BoardColumnView[]
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}

  async execute(input: ReorderBoardColumnsInput): Promise<BoardColumnView[]> {
    await this.access.requireActiveAdmin(input.boardId, input.currentUserId);
    const currentColumns = await this.prisma.boardColumn.findMany({
      where: { boardId: input.boardId },
      orderBy: { position: "asc" },
      select: { id: true },
    });
    const currentIds = new Set(currentColumns.map((column) => column.id));
    const informedIds = input.columns.map((column) => column.id);
    const positions = input.columns.map((column) => column.position);
    const expectedPositions = input.columns.map((_, index) => index);
    const valid =
      input.columns.length === currentColumns.length &&
      new Set(informedIds).size === informedIds.length &&
      informedIds.every((id) => currentIds.has(id)) &&
      new Set(positions).size === positions.length &&
      [...positions]
        .sort((a, b) => a - b)
        .every((position, index) => position === expectedPositions[index]);
    if (!valid) throw new InvalidBoardColumnOrderError();

    return this.prisma.$transaction(async (tx) => {
      await tx.boardColumn.updateMany({
        where: { boardId: input.boardId },
        data: { position: { increment: currentColumns.length } },
      });
      for (const column of input.columns) {
        await tx.boardColumn.update({
          where: { id: column.id },
          data: { position: column.position },
        });
      }
      return tx.boardColumn.findMany({
        where: { boardId: input.boardId },
        orderBy: { position: "asc" },
        select: boardColumnSelect,
      });
    });
  }
}
