import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { BoardMemberNotFoundError } from "../errors/board-member-not-found.error";
import { CannotRemoveBoardOwnerError } from "../errors/cannot-remove-board-owner.error";
import { CannotRemoveLastAdminError } from "../errors/cannot-remove-last-admin.error";
import { BoardAccessService } from "../services/board-access.service";

export type RemoveBoardMemberInput = {
  boardId: string;
  memberId: string;
  currentUserId: string;
};

@Injectable()
export class RemoveBoardMemberUseCase implements UseCase<RemoveBoardMemberInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
  ) {}
  async execute({
    boardId,
    memberId,
    currentUserId,
  }: RemoveBoardMemberInput): Promise<void> {
    await this.access.requireActiveAdmin(boardId, currentUserId);
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { createdById: true },
    });
    const member = await this.prisma.boardMember.findFirst({
      where: { id: memberId, boardId },
      select: { id: true, userId: true, role: true, status: true },
    });
    if (!member) throw new BoardMemberNotFoundError();
    if (member.userId === board?.createdById)
      throw new CannotRemoveBoardOwnerError();
    if (member.role === "ADMIN" && member.status === "ACTIVE") {
      const adminCount = await this.prisma.boardMember.count({
        where: { boardId, role: "ADMIN", status: "ACTIVE" },
      });
      if (adminCount <= 1) throw new CannotRemoveLastAdminError();
    }
    await this.prisma.boardMember.delete({ where: { id: memberId } });
  }
}
