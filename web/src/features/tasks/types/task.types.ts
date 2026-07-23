import type { BoardPerson } from "@/features/boards/types/board.types";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface BoardTask {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assignee: BoardPerson | null;
  sharedUsers: BoardPerson[];
  tags: TaskTag[];
  checklistCount: number;
  completedChecklistCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetails {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assignee: BoardPerson | null;
  createdBy: BoardPerson;
  sharedWith: BoardPerson[];
  tags: TaskTag[];
  checklist: Array<{ id: string; title: string; isCompleted: boolean; position: number }>;
  checklistProgress: { total: number; completed: number; percentage: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  tagIds?: string[];
}

export interface MoveTaskInput {
  boardId: string;
  taskId: string;
  columnId: string;
  position: number;
}

export type DueDateFilter = "all" | "overdue" | "today" | "next-seven-days" | "none";

export interface TaskFilters {
  search: string;
  assigneeId: string;
  priority: "all" | TaskPriority;
  tagId: string;
  dueDate: DueDateFilter;
}
