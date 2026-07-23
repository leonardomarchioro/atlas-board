"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Columns3,
  GripVertical,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBoardColumns,
  useCreateBoardColumn,
  useDeleteBoardColumn,
  useReorderBoardColumns,
  useUpdateBoardColumn,
} from "@/features/board-columns/hooks/board-column-hooks";
import {
  boardColumnSchema,
  type BoardColumnFormValues,
} from "@/features/board-columns/schemas/board-column.schema";
import type { BoardColumnListItem } from "@/features/board-columns/types/board-column.types";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { BoardDetails } from "@/features/boards/types/board.types";

type ColumnsBoard = Pick<BoardDetails, "id" | "name" | "role">;

function columnErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;
  if (error.response?.status === 403) {
    return "Você não possui permissão para realizar esta ação.";
  }
  if (error.response?.status === 404) {
    return "A coluna não foi encontrada. Atualize a lista e tente novamente.";
  }
  if (error.response?.status === 409) {
    const message = error.response.data?.message;
    if (typeof message === "string" && message.includes("possui tarefas")) {
      return "Esta coluna ainda possui tarefas. Mova ou exclua essas tarefas antes de removê-la.";
    }
    return typeof message === "string"
      ? message
      : "Não foi possível concluir a alteração das colunas.";
  }
  return fallback;
}

function ColumnsLoading() {
  return (
    <div className="space-y-2" role="status" aria-label="Carregando colunas">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-8" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}

function SortableColumnRow({
  column,
  index,
  totalColumns,
  disabled,
  onEdit,
  onDelete,
}: {
  column: BoardColumnListItem;
  index: number;
  totalColumns: number;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled,
  });
  const hasTasks = column.tasksCount > 0;
  const isLastColumn = totalColumns === 1;
  const cannotDelete = hasTasks || isLastColumn || disabled;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={
        isDragging
          ? "relative z-10 rounded-lg border bg-background opacity-70 shadow-lg"
          : undefined
      }
    >
      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
        <button
          type="button"
          className="grid size-8 shrink-0 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          aria-label={`Reordenar coluna ${column.name}, posição ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-label text-label-md">{column.name}</p>
          <p className="text-label-sm text-muted-foreground">
            Posição {index + 1} ·{" "}
            {column.tasksCount === 0
              ? "Nenhuma tarefa"
              : `${column.tasksCount} ${column.tasksCount === 1 ? "tarefa" : "tarefas"}`}
          </p>
          {hasTasks ? (
            <p className="mt-1 text-label-sm text-muted-foreground">
              Mova ou exclua as tarefas desta coluna antes de removê-la.
            </p>
          ) : null}
          {isLastColumn ? (
            <p className="mt-1 text-label-sm text-muted-foreground">
              O board precisa manter pelo menos uma coluna.
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={onEdit}
            aria-label={`Renomear coluna ${column.name}`}
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={cannotDelete}
            onClick={onDelete}
            aria-label={`Excluir coluna ${column.name}`}
            title={
              hasTasks
                ? "Mova ou exclua as tarefas desta coluna antes de removê-la."
                : isLastColumn
                  ? "O board precisa manter pelo menos uma coluna."
                  : "Excluir coluna"
            }
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ManageBoardColumnsDialog({
  board,
  open,
  onOpenChange,
}: {
  board: ColumnsBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const columnsQuery = useBoardColumns(board.id, open);
  const createMutation = useCreateBoardColumn();
  const updateMutation = useUpdateBoardColumn();
  const reorderMutation = useReorderBoardColumns();
  const deleteMutation = useDeleteBoardColumn();
  const [editTarget, setEditTarget] = useState<BoardColumnListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoardColumnListItem | null>(null);
  const form = useForm<BoardColumnFormValues>({
    resolver: zodResolver(boardColumnSchema),
    defaultValues: { name: "" },
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const columns = [...(columnsQuery.data ?? [])].sort((a, b) => a.position - b.position);
  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    reorderMutation.isPending ||
    deleteMutation.isPending;

  function resetForm() {
    setEditTarget(null);
    form.reset({ name: "" });
  }

  function changeOpen(nextOpen: boolean) {
    if (busy) return;
    if (!nextOpen) {
      resetForm();
      setDeleteTarget(null);
    }
    onOpenChange(nextOpen);
  }

  function startEdit(column: BoardColumnListItem) {
    setEditTarget(column);
    form.reset({ name: column.name });
    form.setFocus("name");
  }

  async function submit(values: BoardColumnFormValues) {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({
          boardId: board.id,
          columnId: editTarget.id,
          name: values.name.trim(),
        });
      } else {
        await createMutation.mutateAsync({
          boardId: board.id,
          name: values.name.trim(),
        });
      }
      resetForm();
      form.setFocus("name");
    } catch (error) {
      const message = columnErrorMessage(
        error,
        "Não foi possível salvar a coluna. Tente novamente.",
      );
      toast.error(message);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        changeOpen(false);
      }
    }
  }

  function finishReorder(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id || busy) return;
    const from = columns.findIndex((column) => column.id === event.active.id);
    const to = columns.findIndex((column) => column.id === event.over?.id);
    if (from < 0 || to < 0) return;
    const reordered = arrayMove(columns, from, to);
    reorderMutation.mutate({
      boardId: board.id,
      columns: reordered.map((column, position) => ({
        id: column.id,
        position,
      })),
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        boardId: board.id,
        columnId: deleteTarget.id,
      });
      if (editTarget?.id === deleteTarget.id) resetForm();
      setDeleteTarget(null);
    } catch (error) {
      toast.error(columnErrorMessage(error, "Não foi possível excluir a coluna. Tente novamente."));
    }
  }

  const savePending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar colunas</DialogTitle>
            <DialogDescription>
              Crie, renomeie e organize as colunas do board {board.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-6 overflow-y-auto pr-1">
            <form
              className="space-y-2 rounded-lg border bg-muted/30 p-4"
              onSubmit={form.handleSubmit(submit)}
              noValidate
            >
              <Label htmlFor={`board-column-name-${board.id}`}>
                {editTarget ? "Renomear coluna" : "Nova coluna"}
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <Input
                    id={`board-column-name-${board.id}`}
                    placeholder="Ex.: Em revisão"
                    maxLength={50}
                    disabled={busy}
                    aria-invalid={Boolean(form.formState.errors.name)}
                    aria-describedby={
                      form.formState.errors.name ? `board-column-name-error-${board.id}` : undefined
                    }
                    {...form.register("name")}
                  />
                </div>
                <Button type="submit" disabled={busy} className="shrink-0">
                  {savePending ? (
                    <LoaderCircle className="animate-spin" aria-hidden />
                  ) : editTarget ? (
                    <Pencil aria-hidden />
                  ) : (
                    <Plus aria-hidden />
                  )}
                  {savePending ? "Salvando..." : editTarget ? "Salvar nome" : "Criar coluna"}
                </Button>
              </div>
              {form.formState.errors.name ? (
                <p
                  id={`board-column-name-error-${board.id}`}
                  className="text-body-sm text-destructive"
                  role="alert"
                >
                  {form.formState.errors.name.message}
                </p>
              ) : null}
              {editTarget ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  disabled={busy}
                  onClick={resetForm}
                >
                  Cancelar edição
                </Button>
              ) : null}
            </form>

            <section className="space-y-3" aria-labelledby={`board-columns-list-${board.id}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 id={`board-columns-list-${board.id}`} className="font-label text-label-md">
                  Colunas atuais ({columns.length})
                </h3>
                <p className="text-label-sm text-muted-foreground">Arraste para reordenar</p>
              </div>

              {columnsQuery.isPending ? <ColumnsLoading /> : null}
              {columnsQuery.isError ? (
                <div
                  className="rounded-lg border border-destructive/30 p-5 text-center"
                  role="alert"
                >
                  <p className="text-body-sm text-destructive">
                    Não foi possível carregar as colunas.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => void columnsQuery.refetch()}
                  >
                    <RefreshCcw aria-hidden />
                    Tentar novamente
                  </Button>
                </div>
              ) : null}
              {columnsQuery.isSuccess && columns.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Columns3 className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden />
                  <p className="font-label text-label-md">Nenhuma coluna encontrada.</p>
                </div>
              ) : null}
              {columnsQuery.isSuccess && columns.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={finishReorder}
                  accessibility={{
                    announcements: {
                      onDragStart: ({ active }) => `Coluna ${active.id} selecionada.`,
                      onDragOver: ({ over }) =>
                        over ? `Sobre a posição de ${over.id}.` : "Fora da lista.",
                      onDragEnd: ({ over }) =>
                        over
                          ? `Coluna movida para a posição de ${over.id}.`
                          : "Movimentação cancelada.",
                      onDragCancel: () => "Movimentação cancelada.",
                    },
                  }}
                >
                  <SortableContext
                    items={columns.map((column) => column.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {columns.map((column, index) => (
                        <SortableColumnRow
                          key={column.id}
                          column={column}
                          index={index}
                          totalColumns={columns.length}
                          disabled={busy}
                          onEdit={() => startEdit(column)}
                          onDelete={() => setDeleteTarget(column)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : null}
            </section>
          </div>
          <DialogFooter className="border-t-0">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => changeOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir coluna?</DialogTitle>
            <DialogDescription>
              Esta ação não poderá ser desfeita. Nenhuma tarefa será excluída junto com a coluna.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="font-label text-label-md">{deleteTarget.name}</p>
              <p className="text-label-sm text-muted-foreground">
                Posição {deleteTarget.position + 1}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteMutation.isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : null}
              {deleteMutation.isPending ? "Excluindo..." : "Excluir coluna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
