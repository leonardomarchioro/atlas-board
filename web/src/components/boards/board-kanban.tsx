"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { BoardColumn } from "@/components/boards/board-column";
import { BoardTaskCard } from "@/components/boards/board-task-card";
import type { BoardColumn as BoardColumnType } from "@/features/boards/types/board.types";
import type { BoardTask, MoveTaskInput } from "@/features/tasks/types/task.types";

export function BoardKanban({
  boardId,
  columns,
  tasks,
  allTasks,
  isAdmin,
  dragDisabled,
  moving,
  onMove,
  onAddTask,
  onOpenTask,
}: {
  boardId: string;
  columns: BoardColumnType[];
  tasks: BoardTask[];
  allTasks: BoardTask[];
  isAdmin: boolean;
  dragDisabled: boolean;
  moving: boolean;
  onMove: (input: MoveTaskInput) => void;
  onAddTask: (columnId: string) => void;
  onOpenTask: (taskId: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = activeId ? allTasks.find((task) => task.id === activeId) : undefined;
  const orderedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns],
  );
  function finish(event: DragEndEvent) {
    setActiveId(null);
    if (moving || dragDisabled || !event.over) return;
    const task = allTasks.find((item) => item.id === String(event.active.id));
    if (!task) return;
    const overTask = allTasks.find((item) => item.id === String(event.over?.id));
    const columnId = overTask?.columnId ?? String(event.over.id);
    if (!columns.some((column) => column.id === columnId)) return;
    const target = allTasks
      .filter((item) => item.columnId === columnId && item.id !== task.id)
      .sort((a, b) => a.position - b.position);
    const overIndex = overTask
      ? target.findIndex((item) => item.id === overTask.id)
      : target.length;
    const position = overIndex < 0 ? target.length : overIndex;
    if (task.columnId === columnId && task.position === position) return;
    onMove({ boardId, taskId: task.id, columnId, position });
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={finish}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Tarefa ${active.id} selecionada.`,
          onDragOver: ({ over }) => (over ? `Sobre ${over.id}.` : "Fora de uma área de destino."),
          onDragEnd: ({ over }) =>
            over ? `Tarefa movida para ${over.id}.` : "Movimentação cancelada.",
          onDragCancel: () => "Movimentação cancelada.",
        },
      }}
    >
      <div
        className="flex h-full gap-6 overflow-x-auto overflow-y-hidden px-4 pb-5 lg:px-8"
        aria-label="Quadro Kanban"
      >
        {orderedColumns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={tasks
              .filter((task) => task.columnId === column.id)
              .sort((a, b) => a.position - b.position)}
            totalTasks={allTasks.filter((task) => task.columnId === column.id).length}
            isAdmin={isAdmin}
            dragDisabled={dragDisabled || moving}
            onAddTask={onAddTask}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-80">
            <BoardTaskCard task={activeTask} onOpen={() => undefined} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
