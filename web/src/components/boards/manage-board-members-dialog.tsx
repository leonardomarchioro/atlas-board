"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CalendarClock, LoaderCircle, Mail, RefreshCcw, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import {
  useBoardMembers,
  useInviteBoardMember,
  useRemoveBoardMember,
} from "@/features/board-members/hooks/board-member-hooks";
import {
  inviteBoardMemberSchema,
  type InviteBoardMemberFormValues,
} from "@/features/board-members/schemas/invite-board-member.schema";
import type { BoardMemberListItem } from "@/features/board-members/types/board-member.types";
import type { BoardDetails } from "@/features/boards/types/board.types";
import { useAuth } from "@/providers/auth-provider";

type MembersBoard = Pick<BoardDetails, "id" | "name" | "role">;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function memberErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;
  if (error.response?.status === 403) {
    return "Você não possui permissão para realizar esta ação.";
  }
  if (error.response?.status === 409) {
    const message = error.response.data?.message;
    return typeof message === "string" ? message : "Este membro ou convite já existe.";
  }
  return fallback;
}

function MembersLoading() {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando membros">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-lg border p-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ManageBoardMembersDialog({
  board,
  open,
  onOpenChange,
}: {
  board: MembersBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const membersQuery = useBoardMembers(board.id, open);
  const inviteMutation = useInviteBoardMember();
  const removeMutation = useRemoveBoardMember();
  const [removeTarget, setRemoveTarget] = useState<BoardMemberListItem | null>(null);
  const form = useForm<InviteBoardMemberFormValues>({
    resolver: zodResolver(inviteBoardMemberSchema),
    defaultValues: { email: "" },
  });
  const members = membersQuery.data ?? [];
  const activeMembers = members.filter((member) => member.status === "ACTIVE");
  const invitations = members.filter((member) => member.status === "PENDING");
  const busy = inviteMutation.isPending || removeMutation.isPending;

  function changeOpen(nextOpen: boolean) {
    if (!busy) onOpenChange(nextOpen);
  }

  async function invite(values: InviteBoardMemberFormValues) {
    const email = values.email.trim().toLowerCase();
    if (email === user?.email.trim().toLowerCase()) {
      form.setError("email", {
        type: "validate",
        message: "Você já é administrador deste board.",
      });
      return;
    }
    try {
      await inviteMutation.mutateAsync({ boardId: board.id, email });
      form.reset();
    } catch (error) {
      const message = memberErrorMessage(
        error,
        "Não foi possível criar o convite. Tente novamente.",
      );
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        form.setError("email", { type: "server", message });
      } else {
        toast.error(message);
      }
    }
  }

  async function confirmRemoval() {
    if (!removeTarget) return;
    try {
      await removeMutation.mutateAsync({
        boardId: board.id,
        memberId: removeTarget.id,
      });
      setRemoveTarget(null);
    } catch (error) {
      toast.error(memberErrorMessage(error, "Não foi possível remover o membro. Tente novamente."));
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar membros</DialogTitle>
            <DialogDescription>
              Convide colaboradores e gerencie quem possui acesso ao board {board.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 space-y-6 overflow-y-auto pr-1">
            <form
              onSubmit={form.handleSubmit(invite)}
              className="space-y-2 rounded-lg border bg-muted/30 p-4"
              noValidate
            >
              <Label htmlFor={`invite-member-${board.id}`}>Convidar por e-mail</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Mail
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id={`invite-member-${board.id}`}
                    type="email"
                    placeholder="colaborador@example.com"
                    className="pl-9"
                    disabled={busy}
                    aria-invalid={Boolean(form.formState.errors.email)}
                    aria-describedby={
                      form.formState.errors.email
                        ? `invite-member-error-${board.id}`
                        : `invite-member-help-${board.id}`
                    }
                    {...form.register("email")}
                  />
                </div>
                <Button type="submit" disabled={busy}>
                  {inviteMutation.isPending ? (
                    <LoaderCircle className="animate-spin" aria-hidden />
                  ) : (
                    <UserPlus aria-hidden />
                  )}
                  {inviteMutation.isPending ? "Convidando..." : "Convidar"}
                </Button>
              </div>
              {form.formState.errors.email ? (
                <p
                  id={`invite-member-error-${board.id}`}
                  className="text-body-sm text-destructive"
                  role="alert"
                >
                  {form.formState.errors.email.message}
                </p>
              ) : (
                <p
                  id={`invite-member-help-${board.id}`}
                  className="text-body-sm text-muted-foreground"
                >
                  O convite será criado como Colaborador e terá validade de sete dias.
                </p>
              )}
            </form>

            {membersQuery.isPending ? <MembersLoading /> : null}
            {membersQuery.isError ? (
              <div className="rounded-lg border border-destructive/30 p-5 text-center" role="alert">
                <p className="text-body-sm text-destructive">
                  Não foi possível carregar os membros.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => void membersQuery.refetch()}
                >
                  <RefreshCcw aria-hidden />
                  Tentar novamente
                </Button>
              </div>
            ) : null}

            {membersQuery.isSuccess ? (
              <>
                <section className="space-y-3" aria-labelledby={`active-members-${board.id}`}>
                  <h3 id={`active-members-${board.id}`} className="font-label text-label-md">
                    Membros ativos ({activeMembers.length})
                  </h3>
                  {activeMembers.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-body-sm text-muted-foreground">
                      Nenhum membro encontrado.
                    </p>
                  ) : (
                    activeMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar size="lg">
                            {member.user?.avatarUrl ? (
                              <AvatarImage src={member.user.avatarUrl} alt="" />
                            ) : null}
                            <AvatarFallback>
                              {initials(member.user?.name ?? member.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-label text-label-md">
                              {member.user?.name ?? member.email}
                              {member.isOwner ? " (Proprietário)" : ""}
                            </p>
                            <p className="truncate text-body-sm text-muted-foreground">
                              {member.user?.email ?? member.email}
                            </p>
                            <p className="text-label-sm text-muted-foreground">
                              Entrou em {formatDate(member.joinedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <Badge
                            variant={member.role === "ADMIN" ? "info" : "secondary"}
                            className="normal-case"
                          >
                            {member.role === "ADMIN" ? "Administrador" : "Colaborador"}
                          </Badge>
                          {!member.isOwner ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={busy}
                              onClick={() => setRemoveTarget(member)}
                              aria-label={`Remover ${member.user?.name ?? member.email} do board`}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 aria-hidden />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </section>

                <section className="space-y-3" aria-labelledby={`pending-invites-${board.id}`}>
                  <h3 id={`pending-invites-${board.id}`} className="font-label text-label-md">
                    Convites pendentes ({invitations.length})
                  </h3>
                  {invitations.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-body-sm text-muted-foreground">
                      Nenhum convite pendente.
                    </p>
                  ) : (
                    invitations.map((invitation) => {
                      const expired =
                        !invitation.inviteExpiresAt ||
                        new Date(invitation.inviteExpiresAt) <= new Date();
                      return (
                        <div
                          key={invitation.id}
                          className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-label text-label-md">{invitation.email}</p>
                            <p className="text-label-sm text-muted-foreground">
                              Criado em {formatDate(invitation.createdAt)}
                            </p>
                            <p className="flex items-center gap-1.5 text-label-sm text-muted-foreground">
                              <CalendarClock className="size-3.5" aria-hidden />
                              Expira em {formatDate(invitation.inviteExpiresAt)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={expired ? "destructive" : "warning"}
                              className="normal-case"
                            >
                              {expired ? "Expirado" : "Pendente"}
                            </Badge>
                            <Badge variant="secondary" className="normal-case">
                              Colaborador
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => changeOpen(false)}
              disabled={busy}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !removeMutation.isPending) setRemoveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover membro?</DialogTitle>
            <DialogDescription>
              Essa pessoa perderá o acesso ao board e às suas tarefas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={removeMutation.isPending}
              onClick={() => setRemoveTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => void confirmRemoval()}
            >
              {removeMutation.isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : null}
              {removeMutation.isPending ? "Removendo..." : "Remover do board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
