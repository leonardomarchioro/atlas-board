import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  type BoardColumnView,
  boardColumnSelect,
} from "../presentation/selects/board-column.select";
import { BoardAccessService } from "../services/board-access.service";

export interface ListBoardColumnsInput {
  boardId: string;
  currentUserId: string;
}

@Injectable()
export class ListBoardColumnsUseCase implements UseCase<
  ListBoardColumnsInput,
  BoardColumnView[]
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}

  async execute(input: ListBoardColumnsInput): Promise<BoardColumnView[]> {
    await this.access.requireActiveAdmin(input.boardId, input.currentUserId);
    return this.prisma.boardColumn.findMany({
      where: { boardId: input.boardId },
      orderBy: { position: "asc" },
      select: boardColumnSelect,
    });
  }
}
