import type { BoardTask, MoveTaskInput } from "@/features/tasks/types/task.types";

export function moveTaskInCache(tasks: BoardTask[], input: MoveTaskInput): BoardTask[] {
  const moving = tasks.find((task) => task.id === input.taskId);
  if (!moving) return tasks;

  const sourceColumnId = moving.columnId;
  const withoutMoving = tasks.filter((task) => task.id !== input.taskId);
  const target = withoutMoving
    .filter((task) => task.columnId === input.columnId)
    .sort((a, b) => a.position - b.position);
  target.splice(Math.min(input.position, target.length), 0, {
    ...moving,
    columnId: input.columnId,
  });

  const source = withoutMoving
    .filter((task) => task.columnId === sourceColumnId && sourceColumnId !== input.columnId)
    .sort((a, b) => a.position - b.position);
  const positions = new Map<string, { columnId: string; position: number }>();
  target.forEach((task, position) =>
    positions.set(task.id, { columnId: input.columnId, position }),
  );
  source.forEach((task, position) =>
    positions.set(task.id, { columnId: sourceColumnId, position }),
  );

  return tasks.map((task) => {
    const next = positions.get(task.id);
    return next ? { ...task, ...next } : task;
  });
}
