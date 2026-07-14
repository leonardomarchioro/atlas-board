import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TagView, tagSelect } from "../presentation/selects/tag.select";
import { TaskAccessService } from "../services/task-access.service";
export interface ListBoardTagsInput {
  boardId: string;
  currentUserId: string;
}
@Injectable()
export class ListBoardTagsUseCase implements UseCase<
  ListBoardTagsInput,
  TagView[]
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: ListBoardTagsInput): Promise<TagView[]> {
    await this.access.requireBoardAccess(input.boardId, input.currentUserId);
    return this.prisma.tag.findMany({
      where: { boardId: input.boardId },
      select: tagSelect,
      orderBy: { name: "asc" },
    });
  }
}
