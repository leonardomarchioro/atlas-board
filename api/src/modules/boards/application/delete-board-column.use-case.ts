import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { BoardColumnHasTasksError } from "../errors/board-column-has-tasks.error";
import { BoardColumnNotFoundError } from "../errors/board-column-not-found.error";
import { BoardMustHaveColumnError } from "../errors/board-must-have-column.error";
import { BoardAccessService } from "../services/board-access.service";

export interface DeleteBoardColumnInput {
  boardId: string;
  columnId: string;
  currentUserId: string;
}

@Injectable()
export class DeleteBoardColumnUseCase implements UseCase<DeleteBoardColumnInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}

  async execute(input: DeleteBoardColumnInput): Promise<void> {
    await this.access.requireActiveAdmin(input.boardId, input.currentUserId);
    const [column, columnsCount] = await Promise.all([
      this.prisma.boardColumn.findFirst({
        where: { id: input.columnId, boardId: input.boardId },
        select: {
          id: true,
          position: true,
          _count: { select: { tasks: true } },
        },
      }),
      this.prisma.boardColumn.count({ where: { boardId: input.boardId } }),
    ]);
    if (!column) throw new BoardColumnNotFoundError();
    if (column._count.tasks > 0) throw new BoardColumnHasTasksError();
    if (columnsCount <= 1) throw new BoardMustHaveColumnError();

    await this.prisma.$transaction(async (tx) => {
      await tx.boardColumn.delete({ where: { id: column.id } });
      const remaining = await tx.boardColumn.findMany({
        where: { boardId: input.boardId },
        orderBy: { position: "asc" },
        select: { id: true },
      });
      await tx.boardColumn.updateMany({
        where: { boardId: input.boardId },
        data: { position: { increment: columnsCount } },
      });
      for (const [position, item] of remaining.entries()) {
        await tx.boardColumn.update({
          where: { id: item.id },
          data: { position },
        });
      }
    });
  }
}
