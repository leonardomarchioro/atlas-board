import type { TaskCommentWithAuthor } from "../selects/task-comment.select";

export type TaskCommentResponse = {
  id: string;
  taskId: string;
  content: string;
  author: { id: string; name: string; email: string; avatarUrl: string | null };
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
};

export class TaskCommentPresenter {
  static toHTTP(comment: TaskCommentWithAuthor): TaskCommentResponse {
    return {
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isEdited: comment.updatedAt.getTime() !== comment.createdAt.getTime(),
    };
  }
}
