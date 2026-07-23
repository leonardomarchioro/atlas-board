"use client";

import { BoardErrorState } from "@/components/boards/board-states";

export default function BoardRouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <BoardErrorState kind="unexpected" onRetry={reset} />;
}
