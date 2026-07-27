"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Input } from "@/components/ui/input";

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
  const hasSearch = search !== undefined && onSearchChange;
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="atlas-container !w-full !max-w-none !px-16 flex h-18 items-center justify-between gap-4">
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
          <UserMenu />
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
