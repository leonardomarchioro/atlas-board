"use client";

import { ChevronDown, LoaderCircle, LogOut, Search, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
import { Input } from "@/components/ui/input";
import { useLogout } from "@/features/auth/hooks/auth-hooks";
import { useAuth } from "@/providers/auth-provider";

interface AppHeaderProps {
  section: string;
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
}

function SearchField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 bg-surface-low pl-9"
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

export function AppHeader({
  section,
  search,
  searchPlaceholder = "Buscar...",
  onSearchChange,
}: AppHeaderProps) {
  const { user } = useAuth();
  const logout = useLogout();
  const initials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const hasSearch = search !== undefined && onSearchChange;
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="atlas-container !w-full !max-w-none !px-16 flex h-18 justify-between gap-4">
        <div className="flex min-w-0 shrink items-center gap-4 md:gap-6">
          <Link
            href="/dashboard"
            className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Atlas — Dashboard"
          >
            <BrandMark />
          </Link>
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
          <span className="truncate text-body-md text-muted-foreground">{section}</span>
        </div>
        {hasSearch ? (
          <div className="hidden w-full max-w-xl md:block">
            <SearchField value={search} placeholder={searchPlaceholder} onChange={onSearchChange} />
          </div>
        ) : null}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-full px-1.5"
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
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
        </div>
      </div>
      {hasSearch ? (
        <div className="atlas-container !w-full !max-w-none !px-16 pb-3 md:hidden">
          <SearchField value={search} placeholder={searchPlaceholder} onChange={onSearchChange} />
        </div>
      ) : null}
    </header>
  );
}
