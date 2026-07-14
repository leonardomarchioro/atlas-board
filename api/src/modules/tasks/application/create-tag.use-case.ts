import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TagView, tagSelect } from "../presentation/selects/tag.select";
import { TaskAccessService } from "../services/task-access.service";
export interface CreateTagInput {
  boardId: string;
  currentUserId: string;
  name: string;
  color: string;
}
@Injectable()
export class CreateTagUseCase implements UseCase<CreateTagInput, TagView> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: CreateTagInput): Promise<TagView> {
    await this.access.requireBoardAccess(input.boardId, input.currentUserId);
    return this.prisma.tag.create({
      data: {
        boardId: input.boardId,
        name: input.name.trim(),
        color: input.color.toUpperCase(),
      },
      select: tagSelect,
    });
  }
}
