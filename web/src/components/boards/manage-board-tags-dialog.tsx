"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { LoaderCircle, Pencil, Plus, RefreshCcw, Search, Tags, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { TAG_COLORS, TagColorPicker } from "@/components/tags/tag-color-picker";
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
  useCreateBoardTag,
  useDeleteBoardTag,
  useUpdateBoardTag,
} from "@/features/board-tags/hooks/board-tag-mutations";
import {
  boardTagSchema,
  type BoardTagFormValues,
} from "@/features/board-tags/schemas/board-tag.schema";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { BoardDetails } from "@/features/boards/types/board.types";
import { useBoardTags } from "@/features/tasks/hooks/task-hooks";
import type { BoardTag } from "@/features/tasks/types/task.types";

type TagsBoard = Pick<BoardDetails, "id" | "name" | "role">;

function tagErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;
  if (error.response?.status === 403) {
    return "Você não possui permissão para realizar esta ação.";
  }
  if (error.response?.status === 404) {
    return "A tag não foi encontrada. Atualize a lista e tente novamente.";
  }
  if (error.response?.status === 409) {
    const message = error.response.data?.message;
    return typeof message === "string" ? message : "Já existe uma tag com este nome no board.";
  }
  return fallback;
}

function TagsLoading() {
  return (
    <div className="space-y-2" role="status" aria-label="Carregando tags">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}

function TagPreview({ tag }: { tag: BoardTag }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: tag.color }}
        aria-hidden
      />
      <span className="truncate font-label text-label-md">{tag.name}</span>
    </div>
  );
}

export function ManageBoardTagsDialog({
  board,
  open,
  onOpenChange,
}: {
  board: TagsBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const tagsQuery = useBoardTags(board.id, open);
  const createMutation = useCreateBoardTag();
  const updateMutation = useUpdateBoardTag();
  const deleteMutation = useDeleteBoardTag();
  const [editTarget, setEditTarget] = useState<BoardTag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoardTag | null>(null);
  const [search, setSearch] = useState("");
  const form = useForm<BoardTagFormValues>({
    resolver: zodResolver(boardTagSchema),
    defaultValues: { name: "", color: TAG_COLORS[0] },
  });
  const selectedColor = useWatch({ control: form.control, name: "color" });
  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const filteredTags = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedSearch) return tagsQuery.data ?? [];
    return (tagsQuery.data ?? []).filter((tag) =>
      tag.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );
  }, [search, tagsQuery.data]);

  function resetForm() {
    setEditTarget(null);
    form.reset({ name: "", color: TAG_COLORS[0] });
  }

  function changeOpen(nextOpen: boolean) {
    if (busy) return;
    if (!nextOpen) {
      resetForm();
      setDeleteTarget(null);
      setSearch("");
    }
    onOpenChange(nextOpen);
  }

  function startEdit(tag: BoardTag) {
    setEditTarget(tag);
    form.reset({ name: tag.name, color: tag.color });
    form.setFocus("name");
  }

  async function submit(values: BoardTagFormValues) {
    const input = {
      boardId: board.id,
      name: values.name.trim(),
      color: values.color.toUpperCase(),
    };
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ ...input, tagId: editTarget.id });
      } else {
        await createMutation.mutateAsync(input);
      }
      resetForm();
      form.setFocus("name");
    } catch (error) {
      const message = tagErrorMessage(error, "Não foi possível salvar a tag. Tente novamente.");
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        form.setError("name", { type: "server", message });
      } else {
        toast.error(message);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          changeOpen(false);
        }
      }
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        boardId: board.id,
        tagId: deleteTarget.id,
      });
      if (editTarget?.id === deleteTarget.id) resetForm();
      setDeleteTarget(null);
    } catch (error) {
      toast.error(tagErrorMessage(error, "Não foi possível excluir a tag. Tente novamente."));
    }
  }

  const savePending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
        >
          <DialogHeader className="flex-row items-center gap-3 border-b px-6 py-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Tags className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-headline-md">Gerenciar Tags</DialogTitle>
              <DialogDescription className="sr-only">
                Crie e organize as tags utilizadas nas tarefas do board {board.name}.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              disabled={busy}
              aria-label="Fechar gerenciamento de tags"
              onClick={() => changeOpen(false)}
            >
              <X aria-hidden />
            </Button>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-6">
            <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor={`tag-name-${board.id}`}>
                  {editTarget ? "Editar Tag" : "Nome da Tag"}
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <Input
                      id={`tag-name-${board.id}`}
                      placeholder="Ex: Prioridade Alta"
                      maxLength={50}
                      disabled={busy}
                      aria-invalid={Boolean(form.formState.errors.name)}
                      aria-describedby={
                        form.formState.errors.name ? `tag-name-error-${board.id}` : undefined
                      }
                      {...form.register("name")}
                    />
                  </div>
                  <Button type="submit" className="shrink-0 sm:px-6" disabled={busy}>
                    {savePending ? (
                      <LoaderCircle className="animate-spin" aria-hidden />
                    ) : editTarget ? (
                      <Pencil aria-hidden />
                    ) : (
                      <Plus aria-hidden />
                    )}
                    {savePending ? "Salvando..." : editTarget ? "Salvar" : "Criar Tag"}
                  </Button>
                </div>
                {form.formState.errors.name ? (
                  <p
                    id={`tag-name-error-${board.id}`}
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
                    className="h-auto px-1"
                    disabled={busy}
                    onClick={resetForm}
                  >
                    Cancelar edição
                  </Button>
                ) : null}
              </div>

              <div className="space-y-3">
                <Label>Cor da Tag</Label>
                <TagColorPicker
                  value={selectedColor}
                  disabled={busy}
                  onChange={(color) =>
                    form.setValue("color", color, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                {form.formState.errors.color ? (
                  <p className="text-body-sm text-destructive" role="alert">
                    {form.formState.errors.color.message}
                  </p>
                ) : null}
              </div>
            </form>

            <div className="h-px bg-border" aria-hidden />

            <section className="space-y-4" aria-labelledby={`active-tags-${board.id}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3
                  id={`active-tags-${board.id}`}
                  className="font-label text-label-md text-muted-foreground"
                >
                  Tags Ativas ({tagsQuery.data?.length ?? 0})
                </h3>
                <div className="relative">
                  <Search
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filtrar..."
                    className="h-8 rounded-full pl-9 sm:w-36 focus-visible:sm:w-48"
                    aria-label="Filtrar tags por nome"
                  />
                </div>
              </div>

              {tagsQuery.isPending ? <TagsLoading /> : null}
              {tagsQuery.isError ? (
                <div
                  className="rounded-lg border border-destructive/30 p-5 text-center"
                  role="alert"
                >
                  <p className="text-body-sm text-destructive">
                    Não foi possível carregar as tags.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => void tagsQuery.refetch()}
                  >
                    <RefreshCcw aria-hidden />
                    Tentar novamente
                  </Button>
                </div>
              ) : null}

              {tagsQuery.isSuccess && tagsQuery.data.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Tags className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden />
                  <p className="font-label text-label-md">Nenhuma tag criada.</p>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    Crie tags para organizar as tarefas deste board.
                  </p>
                </div>
              ) : null}

              {tagsQuery.isSuccess && tagsQuery.data.length > 0 && filteredTags.length === 0 ? (
                <p className="rounded-lg border border-dashed p-5 text-center text-body-sm text-muted-foreground">
                  Nenhuma tag encontrada.
                </p>
              ) : null}

              {tagsQuery.isSuccess && filteredTags.length > 0 ? (
                <div className="space-y-2">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/60 focus-within:bg-muted/60"
                    >
                      <TagPreview tag={tag} />
                      <span className="ml-auto shrink-0 text-label-sm text-muted-foreground">
                        {tag.tasksCount === 0
                          ? "Nenhuma tarefa"
                          : `${tag.tasksCount} ${tag.tasksCount === 1 ? "tarefa" : "tarefas"}`}
                      </span>
                      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={busy}
                          aria-label={`Editar tag ${tag.name}`}
                          onClick={() => startEdit(tag)}
                        >
                          <Pencil aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={busy}
                          aria-label={`Excluir tag ${tag.name}`}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(tag)}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>

          <DialogFooter className="m-0 rounded-none px-6 py-5">
            <Button
              type="button"
              variant="secondary"
              className="sm:px-8"
              disabled={busy}
              onClick={() => changeOpen(false)}
            >
              Pronto
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
            <DialogTitle>Excluir tag?</DialogTitle>
            <DialogDescription>
              A tag será removida de todas as tarefas deste board. As tarefas não serão excluídas.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <TagPreview tag={deleteTarget} />
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
              {deleteMutation.isPending ? "Excluindo..." : "Excluir tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
