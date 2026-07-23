import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TaskTagNotFoundError } from "../errors/task-tag-not-found.error";
import { TagAlreadyExistsError } from "../errors/tag-already-exists.error";
import { TagView, tagSelect } from "../presentation/selects/tag.select";
import { TaskAccessService } from "../services/task-access.service";
export interface UpdateTagInput {
  boardId: string;
  tagId: string;
  currentUserId: string;
  name?: string;
  color?: string;
}
@Injectable()
export class UpdateTagUseCase implements UseCase<UpdateTagInput, TagView> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: UpdateTagInput): Promise<TagView> {
    await this.access.requireBoardAdmin(input.boardId, input.currentUserId);
    const tag = await this.prisma.tag.findFirst({
      where: { id: input.tagId, boardId: input.boardId },
      select: { id: true },
    });
    if (!tag) throw new TaskTagNotFoundError();

    const name = input.name?.trim();
    if (name !== undefined) {
      const existingTag = await this.prisma.tag.findFirst({
        where: {
          boardId: input.boardId,
          name,
          id: { not: input.tagId },
        },
        select: { id: true },
      });
      if (existingTag) throw new TagAlreadyExistsError();
    }

    const data: Prisma.TagUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (input.color !== undefined) data.color = input.color.toUpperCase();
    return this.prisma.tag.update({
      where: { id: input.tagId },
      data,
      select: tagSelect,
    });
  }
}
