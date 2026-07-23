import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TagAlreadyExistsError } from "../errors/tag-already-exists.error";
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
    await this.access.requireBoardAdmin(input.boardId, input.currentUserId);
    const name = input.name.trim();
    const existingTag = await this.prisma.tag.findUnique({
      where: {
        boardId_name: {
          boardId: input.boardId,
          name,
        },
      },
      select: { id: true },
    });
    if (existingTag) throw new TagAlreadyExistsError();

    return this.prisma.tag.create({
      data: {
        boardId: input.boardId,
        name,
        color: input.color.toUpperCase(),
      },
      select: tagSelect,
    });
  }
}
