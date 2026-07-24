"use client";

import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BoardHeader } from "@/components/boards/board-header";
import { BoardKanban } from "@/components/boards/board-kanban";
import { BoardSidebar } from "@/components/boards/board-sidebar";
import { BoardTaskDetailsDialog } from "@/components/boards/board-task-details-dialog";
import { BoardTaskFormDialog } from "@/components/boards/board-task-form-dialog";
import { BoardToolbar } from "@/components/boards/board-toolbar";
import {
  BoardErrorState,
  BoardLoading,
  BoardWithoutColumns,
} from "@/components/boards/board-states";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import { useBoardDetails } from "@/features/boards/hooks/use-board-details";
import { useUserBoards } from "@/features/boards/hooks/use-user-boards";
import { useBoardTags, useBoardTasks, useMoveTask } from "@/features/tasks/hooks/task-hooks";
import type { TaskFilters } from "@/features/tasks/types/task.types";
import { countActiveFilters, filterBoardTasks } from "@/features/tasks/utils/filter-board-tasks";

const emptyFilters: TaskFilters = {
  search: "",
  assigneeId: "all",
  priority: "all",
  tagId: "all",
  dueDate: "all",
};

export function BoardWorkspace({ boardId }: { boardId: string }) {
  const boardQuery = useBoardDetails(boardId);
  const tasksQuery = useBoardTasks(boardId);
  const tagsQuery = useBoardTags(boardId);
  const boardsQuery = useUserBoards();
  const moveMutation = useMoveTask();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const taskId = searchParams.get("task");
  const creatingTask = searchParams.get("createTask") === "true";
  const createColumnId = searchParams.get("columnId");
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const visibleTasks = useMemo(() => filterBoardTasks(tasks, filters), [filters, tasks]);
  const activeFilters = countActiveFilters(filters);

  if (boardQuery.isPending || tasksQuery.isPending) return <BoardLoading />;
  if (boardQuery.isError) {
    const status = axios.isAxiosError<ApiErrorResponse>(boardQuery.error)
      ? boardQuery.error.response?.status
      : undefined;
    return (
      <BoardErrorState
        kind={
          status === 404 || status === 400 || status === 422
            ? "not-found"
            : status === 403
              ? "denied"
              : "unexpected"
        }
        onRetry={() => void boardQuery.refetch()}
      />
    );
  }
  if (tasksQuery.isError)
    return <BoardErrorState kind="unexpected" onRetry={() => void tasksQuery.refetch()} />;
  const board = boardQuery.data;
  const openTask = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("createTask");
    params.delete("columnId");
    params.set("task", id);
    router.push(`${pathname}?${params}`);
  };
  const closeTask = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("task");
    router.replace(params.size ? `${pathname}?${params}` : pathname);
  };
  const closeCreate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("createTask");
    params.delete("columnId");
    router.replace(params.size ? `${pathname}?${params}` : pathname);
  };
  const openCreate = (columnId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("task");
    params.set("createTask", "true");
    if (columnId) params.set("columnId", columnId);
    else params.delete("columnId");
    router.push(`${pathname}?${params}`);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppHeader section={`Boards / ${board.name}`} />
      <div className="flex min-h-0 flex-1 pt-18">
        <BoardSidebar boards={boardsQuery.data ?? []} currentBoardId={board.id} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <BoardHeader board={board} tasksCount={tasks.length} />
          <BoardToolbar
            filters={filters}
            members={board.members}
            tags={tagsQuery.data ?? []}
            activeCount={activeFilters}
            onChange={setFilters}
            onClear={() => setFilters(emptyFilters)}
            onCreate={() => openCreate()}
          />
          {activeFilters > 0 ? (
            <p className="px-4 py-2 text-center text-label-sm text-muted-foreground lg:px-8">
              {visibleTasks.length} de {tasks.length} tarefas visíveis. Limpe os filtros para
              reativar a movimentação.
            </p>
          ) : null}
          {board.columns.length ? (
            <div className="min-h-0 flex-1 pt-4">
              <BoardKanban
                boardId={board.id}
                columns={board.columns}
                tasks={visibleTasks}
                allTasks={tasks}
                isAdmin={board.role === "ADMIN"}
                dragDisabled={activeFilters > 0}
                moving={moveMutation.isPending}
                onMove={(input) => moveMutation.mutate(input)}
                onAddTask={openCreate}
                onOpenTask={openTask}
              />
            </div>
          ) : (
            <BoardWithoutColumns isAdmin={board.role === "ADMIN"} />
          )}
        </main>
      </div>
      <BoardTaskFormDialog
        boardId={board.id}
        boardName={board.name}
        columns={board.columns}
        members={board.members}
        tags={tagsQuery.data ?? []}
        open={creatingTask}
        initialColumnId={createColumnId ?? board.columns[0]?.id ?? ""}
        onOpenChange={(open) => {
          if (!open) closeCreate();
        }}
      />
      <BoardTaskDetailsDialog
        taskId={taskId}
        board={board}
        boardTasks={tasks}
        tags={tagsQuery.data ?? []}
        onClose={closeTask}
      />
    </div>
  );
}
