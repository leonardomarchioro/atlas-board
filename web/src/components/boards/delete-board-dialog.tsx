"use client";

import axios from "axios";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { BoardDetails } from "@/features/boards/types/board.types";
import { useDeleteBoard } from "@/features/boards/hooks/use-delete-board";

type DeleteBoard = Pick<BoardDetails, "id" | "name" | "role">;

function deleteErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Não foi possível excluir o board. Tente novamente.";
  }
  if (error.response?.status === 403) {
    return "Você não possui permissão para realizar esta ação.";
  }
  if (error.response?.status === 404) {
    return "Este board não foi encontrado ou já foi excluído.";
  }
  return "Não foi possível excluir o board. Tente novamente.";
}

export function DeleteBoardDialog({
  board,
  open,
  onOpenChange,
}: {
  board: DeleteBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const mutation = useDeleteBoard();
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation === board.name;

  function changeOpen(nextOpen: boolean) {
    if (mutation.isPending) return;
    if (!nextOpen) setConfirmation("");
    onOpenChange(nextOpen);
  }

  async function confirmDelete() {
    if (!confirmed || mutation.isPending) return;
    try {
      await mutation.mutateAsync(board.id);
      setConfirmation("");
      onOpenChange(false);
      router.replace("/dashboard");
    } catch (error) {
      toast.error(deleteErrorMessage(error));
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        changeOpen(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert aria-hidden />
          </div>
          <DialogTitle>Excluir board permanentemente?</DialogTitle>
          <DialogDescription>
            O board, suas colunas, tarefas, comentários, checklists, tags e convites serão
            excluídos. Esta ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <Label htmlFor={`delete-board-confirmation-${board.id}`}>
            Digite <strong>&quot;{board.name}&quot;</strong> para confirmar
          </Label>
          <Input
            id={`delete-board-confirmation-${board.id}`}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={mutation.isPending}
            autoComplete="off"
            aria-describedby={`delete-board-warning-${board.id}`}
          />
          <p
            id={`delete-board-warning-${board.id}`}
            className="text-label-sm text-muted-foreground"
          >
            O nome deve corresponder exatamente, incluindo letras maiúsculas e espaços.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => changeOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!confirmed || mutation.isPending}
            onClick={() => void confirmDelete()}
          >
            {mutation.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            {mutation.isPending ? "Excluindo..." : "Excluir permanentemente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
