import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BoardInvitationLoading() {
  return (
    <Card
      className="w-full max-w-2xl gap-6 bg-card/90 p-2 shadow-overlay backdrop-blur-xl"
      role="status"
      aria-label="Carregando convite"
    >
      <CardHeader className="gap-4">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-12 w-full" />
      </CardContent>
      <span className="sr-only">Carregando informações do convite...</span>
    </Card>
  );
}
