import { CircleHelp, LayoutDashboard, Settings, View } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BoardSummary } from "@/features/boards/types/board.types";

export function BoardSidebar({
  boards,
  currentBoardId,
}: {
  boards: BoardSummary[];
  currentBoardId: string;
}) {
  return (
    <aside
      className="group/sidebar hidden h-[calc(100vh-4.5rem)] w-16 shrink-0 overflow-hidden border-r bg-surface-low transition-[width] duration-300 hover:w-60 md:flex md:flex-col"
      aria-label="Navegação interna"
    >
      <nav className="flex flex-col gap-1 p-3">
        <Link
          href="/dashboard"
          className="flex h-10 items-center gap-4 rounded-md px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LayoutDashboard className="size-5 shrink-0" aria-hidden />
          <span className="whitespace-nowrap opacity-0 transition-opacity group-hover/sidebar:opacity-100">
            Dashboard
          </span>
        </Link>
        <span className="flex h-10 items-center gap-4 rounded-md bg-accent px-2 text-accent-foreground">
          <View className="size-5 shrink-0" aria-hidden />
          <span className="whitespace-nowrap opacity-0 transition-opacity group-hover/sidebar:opacity-100">
            Boards
          </span>
        </span>
        <button
          disabled
          className="flex h-10 items-center gap-4 rounded-md px-2 text-muted-foreground opacity-60"
        >
          <Settings className="size-5 shrink-0" aria-hidden />
          <span className="whitespace-nowrap opacity-0 transition-opacity group-hover/sidebar:opacity-100">
            Configurações
          </span>
        </button>
      </nav>
      <div className="mx-4 border-t" />
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="px-2 py-2 font-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-0 group-hover/sidebar:opacity-100">
          Meus boards
        </p>
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className={`flex h-10 items-center justify-between gap-3 rounded-md px-2 text-body-sm ${board.id === currentBoardId ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
          >
            <span className="min-w-0 truncate opacity-0 group-hover/sidebar:opacity-100">
              {board.name}
            </span>
            <Badge
              variant={board.role === "ADMIN" ? "info" : "secondary"}
              className="hidden shrink-0 text-[9px] group-hover/sidebar:flex"
            >
              {board.role === "ADMIN" ? "ADMIN" : "COLAB"}
            </Badge>
          </Link>
        ))}
      </div>
      <div className="border-t p-3">
        <button
          disabled
          className="flex h-10 items-center gap-4 px-2 text-muted-foreground opacity-60"
        >
          <CircleHelp className="size-5 shrink-0" aria-hidden />
          <span className="opacity-0 group-hover/sidebar:opacity-100">Ajuda</span>
        </button>
      </div>
    </aside>
  );
}
