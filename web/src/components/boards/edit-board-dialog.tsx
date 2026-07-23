"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import { useUpdateBoard } from "@/features/boards/hooks/use-update-board";
import {
  updateBoardSchema,
  type UpdateBoardFormValues,
} from "@/features/boards/schemas/update-board.schema";
import type { BoardDetails } from "@/features/boards/types/board.types";

type EditableBoard = Pick<BoardDetails, "id" | "name" | "description" | "role">;

function updateErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.status === 403) {
    return "Você não possui permissão para realizar esta ação.";
  }
  return "Não foi possível atualizar o board. Tente novamente.";
}

export function EditBoardDialog({
  board,
  open,
  onOpenChange,
}: {
  board: EditableBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useUpdateBoard();
  const resetMutation = mutation.reset;
  const form = useForm<UpdateBoardFormValues>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: {
      name: board.name,
      description: board.description ?? "",
    },
  });
  const name = useWatch({ control: form.control, name: "name" });
  const description = useWatch({
    control: form.control,
    name: "description",
  });

  useEffect(() => {
    if (!open) return;
    resetMutation();
    form.reset({
      name: board.name,
      description: board.description ?? "",
    });
  }, [board.description, board.name, form, open, resetMutation]);

  function changeOpen(nextOpen: boolean) {
    if (!mutation.isPending) onOpenChange(nextOpen);
  }

  async function submit(values: UpdateBoardFormValues) {
    const normalizedName = values.name.trim();
    const normalizedDescription = values.description.trim();
    const originalName = board.name.trim();
    const originalDescription = (board.description ?? "").trim();
    const nameChanged = normalizedName !== originalName;
    const descriptionChanged = normalizedDescription !== originalDescription;

    if (!nameChanged && !descriptionChanged) {
      onOpenChange(false);
      return;
    }

    try {
      await mutation.mutateAsync({
        boardId: board.id,
        ...(nameChanged ? { name: normalizedName } : {}),
        ...(descriptionChanged ? { description: normalizedDescription || null } : {}),
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(updateErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar board</DialogTitle>
          <DialogDescription>
            Atualize o nome e a descrição. Colunas, membros e tags são gerenciados separadamente.
          </DialogDescription>
        </DialogHeader>
        <form
          id={`edit-board-${board.id}`}
          onSubmit={form.handleSubmit(submit)}
          className="space-y-5"
          noValidate
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={`edit-board-name-${board.id}`}>
                Nome do board <span className="text-destructive">*</span>
              </Label>
              <span className="text-label-sm text-muted-foreground">{name.length}/100</span>
            </div>
            <Input
              id={`edit-board-name-${board.id}`}
              autoFocus
              maxLength={100}
              disabled={mutation.isPending}
              aria-invalid={Boolean(form.formState.errors.name)}
              aria-describedby={
                form.formState.errors.name ? `edit-board-name-error-${board.id}` : undefined
              }
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p
                id={`edit-board-name-error-${board.id}`}
                className="text-body-sm text-destructive"
                role="alert"
              >
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={`edit-board-description-${board.id}`}>Descrição</Label>
              <span className="text-label-sm text-muted-foreground">{description.length}/500</span>
            </div>
            <Textarea
              id={`edit-board-description-${board.id}`}
              rows={4}
              maxLength={500}
              disabled={mutation.isPending}
              placeholder="Descreva o propósito deste board..."
              aria-invalid={Boolean(form.formState.errors.description)}
              aria-describedby={
                form.formState.errors.description
                  ? `edit-board-description-error-${board.id}`
                  : undefined
              }
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p
                id={`edit-board-description-error-${board.id}`}
                className="text-body-sm text-destructive"
                role="alert"
              >
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>
          {mutation.isError ? (
            <p className="text-body-sm text-destructive" role="alert">
              A atualização não foi concluída. Seus dados foram preservados.
            </p>
          ) : null}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => changeOpen(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form={`edit-board-${board.id}`} disabled={mutation.isPending}>
            {mutation.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            {mutation.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
