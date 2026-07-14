import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { BoardAccessService } from "../services/board-access.service";

export type DeleteBoardInput = { boardId: string; currentUserId: string };

@Injectable()
export class DeleteBoardUseCase implements UseCase<DeleteBoardInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}
  async execute({ boardId, currentUserId }: DeleteBoardInput): Promise<void> {
    await this.access.requireActiveAdmin(boardId, currentUserId);
    await this.prisma.board.delete({ where: { id: boardId } });
  }
}
