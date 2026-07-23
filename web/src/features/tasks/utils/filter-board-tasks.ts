import type { BoardTask, TaskFilters } from "@/features/tasks/types/task.types";

function dayStart(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function filterBoardTasks(tasks: BoardTask[], filters: TaskFilters) {
  const search = filters.search.trim().toLocaleLowerCase("pt-BR");
  const today = dayStart(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 8);
  return tasks.filter((task) => {
    if (search && !task.title.toLocaleLowerCase("pt-BR").includes(search)) return false;
    if (filters.assigneeId === "unassigned" && task.assignee) return false;
    if (
      filters.assigneeId !== "all" &&
      filters.assigneeId !== "unassigned" &&
      task.assignee?.id !== filters.assigneeId
    )
      return false;
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.tagId !== "all" && !task.tags.some((tag) => tag.id === filters.tagId)) return false;
    if (filters.dueDate === "none") return task.dueDate === null;
    if (filters.dueDate === "all") return true;
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    if (filters.dueDate === "overdue") return due < today;
    if (filters.dueDate === "today") return due >= today && due < tomorrow;
    return due >= today && due < nextWeek;
  });
}

export function countActiveFilters(filters: TaskFilters) {
  return (
    Number(Boolean(filters.search.trim())) +
    Number(filters.assigneeId !== "all") +
    Number(filters.priority !== "all") +
    Number(filters.tagId !== "all") +
    Number(filters.dueDate !== "all")
  );
}
