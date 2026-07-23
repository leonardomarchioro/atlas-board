import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { BoardColumnNotFoundError } from "../errors/board-column-not-found.error";
import {
  type BoardColumnView,
  boardColumnSelect,
} from "../presentation/selects/board-column.select";
import { BoardAccessService } from "../services/board-access.service";

export interface UpdateBoardColumnInput {
  boardId: string;
  columnId: string;
  currentUserId: string;
  name: string;
}

@Injectable()
export class UpdateBoardColumnUseCase implements UseCase<
  UpdateBoardColumnInput,
  BoardColumnView
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}

  async execute(input: UpdateBoardColumnInput): Promise<BoardColumnView> {
    await this.access.requireActiveAdmin(input.boardId, input.currentUserId);
    const column = await this.prisma.boardColumn.findFirst({
      where: { id: input.columnId, boardId: input.boardId },
      select: { id: true },
    });
    if (!column) throw new BoardColumnNotFoundError();

    return this.prisma.boardColumn.update({
      where: { id: input.columnId },
      data: { name: input.name.trim() },
      select: boardColumnSelect,
    });
  }
}
