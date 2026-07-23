import type { TaskDetails } from "../selects/task-details.select";
import type { TaskSummary } from "../selects/task-summary.select";

function progress(items: Array<{ isCompleted: boolean }>) {
  const total = items.length;
  const completed = items.filter((item) => item.isCompleted).length;
  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export class TaskPresenter {
  static toDetails(task: TaskDetails) {
    return {
      id: task.id,
      boardId: task.boardId,
      columnId: task.columnId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      position: task.position,
      dueDate: task.dueDate,
      assignee: task.assignee,
      createdBy: task.createdBy,
      sharedWith: task.sharedWith.map(({ user }) => user),
      tags: task.tags.map(({ tag }) => tag),
      checklist: task.checklistItems,
      checklistProgress: progress(task.checklistItems),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  static toSummary(task: TaskSummary) {
    const checklistProgress = progress(task.checklistItems);
    return {
      id: task.id,
      boardId: task.boardId,
      columnId: task.columnId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      position: task.position,
      dueDate: task.dueDate,
      assignee: task.assignee,
      sharedUsers: task.sharedWith.map(({ user }) => user),
      tags: task.tags.map(({ tag }) => tag),
      checklistCount: checklistProgress.total,
      completedChecklistCount: checklistProgress.completed,
      commentsCount: task._count.comments,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
