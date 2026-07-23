"use client";

import { AppHeader } from "@/components/layout/app-header";

export function DashboardHeader({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <AppHeader
      section="Dashboard"
      search={search}
      searchPlaceholder="Buscar boards..."
      onSearchChange={onSearchChange}
    />
  );
}
