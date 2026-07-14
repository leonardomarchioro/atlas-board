import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  BoardMemberView,
  boardMemberSelect,
} from "../presentation/selects/board-member.select";
import { BoardAccessService } from "../services/board-access.service";

export type ListBoardMembersInput = { boardId: string; currentUserId: string };

@Injectable()
export class ListBoardMembersUseCase implements UseCase<
  ListBoardMembersInput,
  BoardMemberView[]
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}
  async execute({
    boardId,
    currentUserId,
  }: ListBoardMembersInput): Promise<BoardMemberView[]> {
    await this.access.requireActiveMember(boardId, currentUserId);
    return this.prisma.boardMember.findMany({
      where: { boardId },
      select: boardMemberSelect,
      orderBy: { createdAt: "asc" },
    });
  }
}
