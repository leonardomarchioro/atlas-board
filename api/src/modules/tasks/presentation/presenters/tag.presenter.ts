import type { TagView } from "../selects/tag.select";
export class TagPresenter {
  static toHTTP(tag: TagView) {
    return {
      id: tag.id,
      boardId: tag.boardId,
      name: tag.name,
      color: tag.color,
      tasksCount: tag._count.tasks,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
