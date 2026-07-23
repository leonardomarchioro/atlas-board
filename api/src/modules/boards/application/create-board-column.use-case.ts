import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  type BoardColumnView,
  boardColumnSelect,
} from "../presentation/selects/board-column.select";
import { BoardAccessService } from "../services/board-access.service";

export interface CreateBoardColumnInput {
  boardId: string;
  currentUserId: string;
  name: string;
}

@Injectable()
export class CreateBoardColumnUseCase implements UseCase<
  CreateBoardColumnInput,
  BoardColumnView
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}

  async execute(input: CreateBoardColumnInput): Promise<BoardColumnView> {
    await this.access.requireActiveAdmin(input.boardId, input.currentUserId);
    return this.prisma.$transaction(async (tx) => {
      const lastColumn = await tx.boardColumn.findFirst({
        where: { boardId: input.boardId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      return tx.boardColumn.create({
        data: {
          boardId: input.boardId,
          name: input.name.trim(),
          position: (lastColumn?.position ?? -1) + 1,
        },
        select: boardColumnSelect,
      });
    });
  }
}
