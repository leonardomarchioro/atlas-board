import { Injectable } from "@nestjs/common";
import { BoardAccessService } from "@modules/boards/services/board-access.service";
import { BoardAccessDeniedError } from "@modules/boards/errors/board-access-denied.error";
import { PrismaService } from "@shared/database/prisma.service";
import { TaskAccessDeniedError } from "../errors/task-access-denied.error";
import { TaskColumnNotFoundError } from "../errors/task-column-not-found.error";
import { TaskNotFoundError } from "../errors/task-not-found.error";
import { TaskTagNotFoundError } from "../errors/task-tag-not-found.error";
import { TaskUserNotBoardMemberError } from "../errors/task-user-not-board-member.error";

@Injectable()
export class TaskAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardAccess: BoardAccessService,
  ) {}

  async requireBoardAccess(boardId: string, userId: string): Promise<void> {
    try {
      await this.boardAccess.requireActiveMember(boardId, userId);
    } catch (error) {
      if (error instanceof BoardAccessDeniedError)
        throw new TaskAccessDeniedError();
      throw error;
    }
  }

  async requireTaskAccess(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, boardId: true, columnId: true, position: true },
    });
    if (!task) throw new TaskNotFoundError();
    await this.requireBoardAccess(task.boardId, userId);
    return task;
  }

  async requireColumn(boardId: string, columnId: string): Promise<void> {
    const column = await this.prisma.boardColumn.findFirst({
      where: { id: columnId, boardId },
      select: { id: true },
    });
    if (!column) throw new TaskColumnNotFoundError();
  }

  async requireActiveUsers(
    boardId: string,
    userIds: string[],
  ): Promise<string[]> {
    const ids = [...new Set(userIds)];
    if (ids.length === 0) return ids;
    const members = await this.prisma.boardMember.findMany({
      where: { boardId, userId: { in: ids }, status: "ACTIVE" },
      select: { userId: true },
    });
    if (members.length !== ids.length || members.some(({ userId }) => !userId))
      throw new TaskUserNotBoardMemberError();
    return ids;
  }

  async requireTags(boardId: string, tagIds: string[]): Promise<string[]> {
    const ids = [...new Set(tagIds)];
    if (ids.length === 0) return ids;
    const count = await this.prisma.tag.count({
      where: { boardId, id: { in: ids } },
    });
    if (count !== ids.length) throw new TaskTagNotFoundError();
    return ids;
  }
}
