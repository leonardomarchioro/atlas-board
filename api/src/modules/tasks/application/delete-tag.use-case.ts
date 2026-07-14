import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TaskTagNotFoundError } from "../errors/task-tag-not-found.error";
import { TaskAccessService } from "../services/task-access.service";
export interface DeleteTagInput {
  boardId: string;
  tagId: string;
  currentUserId: string;
}
@Injectable()
export class DeleteTagUseCase implements UseCase<DeleteTagInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: DeleteTagInput): Promise<void> {
    await this.access.requireBoardAccess(input.boardId, input.currentUserId);
    await this.prisma.$transaction(async (tx) => {
      const result = await tx.tag.deleteMany({
        where: { id: input.tagId, boardId: input.boardId },
      });
      if (result.count === 0) throw new TaskTagNotFoundError();
    });
  }
}
