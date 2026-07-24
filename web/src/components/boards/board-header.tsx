import { ListChecks, Users } from "lucide-react";
import Link from "next/link";
import { BoardAdminMenu } from "@/components/boards/board-admin-menu";
import { BoardMembers } from "@/components/boards/board-members";
import { Badge } from "@/components/ui/badge";
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
          <Badge className="h-7 justify-self-start px-3 py-1 normal-case" variant={isAdmin ? "info" : "secondary"}>
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
        {isAdmin ? <BoardAdminMenu board={board} triggerVariant="outline" /> : null}
      </div>
    </section>
  );
}
