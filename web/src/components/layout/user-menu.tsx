"use client";

import { ChevronDown, LoaderCircle, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/auth-hooks";
import { useAuth } from "@/providers/auth-provider";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const logout = useLogout();
  const initials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={
              compact ? "h-10 w-full justify-start gap-4 px-1" : "h-10 gap-2 rounded-full px-1.5"
            }
            aria-label="Abrir menu do usuário"
          />
        }
      >
        <Avatar>
          {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials || "AT"}
          </AvatarFallback>
        </Avatar>
        {compact ? (
          <span className="min-w-0 flex-1 truncate text-left opacity-0 transition-opacity group-hover/sidebar:opacity-100">
            {user?.name}
          </span>
        ) : null}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground ${compact ? "opacity-0 transition-opacity group-hover/sidebar:opacity-100" : ""}`}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={compact ? "start" : "end"}
        side={compact ? "right" : "bottom"}
        className="w-56"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <span className="block truncate text-foreground">{user?.name}</span>
          <span className="block truncate font-normal">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserRound aria-hidden />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings aria-hidden />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate(undefined)}
        >
          {logout.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : (
            <LogOut aria-hidden />
          )}
          {logout.isPending ? "Saindo..." : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
