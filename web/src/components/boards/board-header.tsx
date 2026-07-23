import { ListChecks, MoreHorizontal, Settings, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { BoardMembers } from "@/components/boards/board-members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BoardDetails } from "@/features/boards/types/board.types";

export function BoardHeader({ board, tasksCount }: { board: BoardDetails; tasksCount: number }) {
  const isAdmin = board.role === "ADMIN";
  return (
    <section className="flex flex-col justify-between gap-5 border-b px-4 py-5 lg:flex-row lg:items-end lg:px-8">
      <div className="min-w-0 max-w-3xl">
        <div className="mb-2 flex items-center gap-2 text-body-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground hover:underline">
            Meus boards
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate">{board.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-headline-lg">{board.name}</h1>
          <Badge variant={isAdmin ? "info" : "secondary"}>
            {isAdmin ? "Administrador" : "Colaborador"}
          </Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          {board.description || "Este board ainda não possui uma descrição."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-body-sm">
          <span className="flex items-center gap-2">
            <Users className="size-4 text-primary" aria-hidden />
            <strong>{board.members.length}</strong> membros
          </span>
          <span className="flex items-center gap-2">
            <ListChecks className="size-4 text-primary" aria-hidden />
            <strong>{tasksCount}</strong> tarefas
          </span>
          <BoardMembers members={board.members} />
        </div>
      </div>
      <div className="flex items-center gap-2 self-start lg:self-auto">
        {isAdmin ? (
          <Button
            variant="outline"
            disabled
            title="Gerenciamento de convites ainda não disponível nesta tela"
          >
            <UserPlus aria-hidden />
            Convidar
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="icon" aria-label="Ações do board" />}
          >
            <MoreHorizontal aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações do board</DropdownMenuLabel>
            {isAdmin ? (
              <>
                <DropdownMenuItem disabled>
                  <Settings aria-hidden />
                  Editar board
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Gerenciar membros</DropdownMenuItem>
                <DropdownMenuItem disabled>Gerenciar tags</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" disabled>
                  Excluir board
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem disabled>Sem ações administrativas</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
