import { LayoutDashboard, PanelsTopLeft, Settings, View } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationTrigger } from "@/components/notifications/notification-trigger";
import { ThemeButton } from "@/components/theme/theme-toggle";
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
      className="group/sidebar hidden h-screen w-16 shrink-0 overflow-hidden border-r bg-surface-low transition-[width] duration-300 hover:w-60 md:flex md:flex-col"
      aria-label="Navegação interna"
    >
      <div className="flex h-18 shrink-0 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="block w-max rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Atlas — Dashboard"
        >
          <BrandMark
            size="sm"
            className="[&>span:last-child]:invisible [&>span:last-child]:opacity-0 [&>span:last-child]:transition-opacity group-hover/sidebar:[&>span:last-child]:visible group-hover/sidebar:[&>span:last-child]:opacity-100"
          />
        </Link>
      </div>
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
      </nav>
      <div className="mx-4 border-t" />
      <div className="min-h-0 flex-1 overflow-hidden p-3 group-hover/sidebar:overflow-y-auto">
        <p className="h-8 whitespace-nowrap px-2 py-2 font-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-0 transition-opacity group-hover/sidebar:opacity-100">
          Meus boards
        </p>
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            title={board.name}
            aria-label={`Abrir board ${board.name}`}
            className={`flex h-10 items-center gap-4 rounded-md px-2 text-body-sm ${board.id === currentBoardId ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
          >
            <PanelsTopLeft className="size-5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate opacity-0 transition-opacity group-hover/sidebar:opacity-100">
              {board.name}
            </span>
            <Badge
              variant={board.role === "ADMIN" ? "info" : "secondary"}
              className="hidden shrink-0 text-[9px] group-hover/sidebar:flex normal-case"
            >
              {board.role === "ADMIN" ? "Admin" : "Colab"}
            </Badge>
          </Link>
        ))}
      </div>
      <div className="border-t p-3 flex flex-col gap-2">
        <ThemeButton />
        <NotificationTrigger sidebar />
        <UserMenu compact />
      </div>
    </aside>
  );
}
