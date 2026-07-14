import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  BoardSummary,
  boardSummarySelect,
} from "../presentation/selects/board-summary.select";

export type ListUserBoardsInput = { userId: string };

@Injectable()
export class ListUserBoardsUseCase implements UseCase<
  ListUserBoardsInput,
  BoardSummary[]
> {
  constructor(private readonly prisma: PrismaService) {}
  execute({ userId }: ListUserBoardsInput): Promise<BoardSummary[]> {
    return this.prisma.board.findMany({
      where: { members: { some: { userId, status: "ACTIVE" } } },
      select: boardSummarySelect,
      orderBy: { updatedAt: "desc" },
    });
  }
}
