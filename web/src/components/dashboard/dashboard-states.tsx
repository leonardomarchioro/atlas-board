import { CircleAlert, LayoutDashboard, Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando boards">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
        <Skeleton className="hidden h-10 w-44 sm:block" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-5 rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-7 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex -space-x-2">
                <Skeleton className="size-8 rounded-full ring-2 ring-background" />
                <Skeleton className="size-8 rounded-full ring-2 ring-background" />
                <Skeleton className="size-8 rounded-full ring-2 ring-background" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="border-t pt-4">
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoardsEmptyState() {
  return (
    <section className="flex flex-col items-center py-20 text-center">
      <span className="mb-6 grid size-24 place-items-center rounded-full bg-primary/10 text-primary">
        <LayoutDashboard className="size-12" aria-hidden />
      </span>
      <h2 className="mb-2 text-headline-md font-bold">
        Você ainda não possui nenhum board vinculado.
      </h2>
      <p className="mb-6 max-w-md text-body-md text-muted-foreground">
        Crie seu primeiro board para organizar tarefas, convidar pessoas e acompanhar o progresso do
        seu trabalho.
      </p>
      <Link href="/boards/create" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8")}>
        <Plus aria-hidden />
        Criar Primeiro Board
      </Link>
    </section>
  );
}

export function BoardsNoResults({ onClear }: { onClear: () => void }) {
  return (
    <section className="flex flex-col items-center py-20 text-center">
      <SearchX className="mb-5 size-12 text-muted-foreground" aria-hidden />
      <h2 className="mb-2 text-headline-md font-bold">Nenhum board encontrado.</h2>
      <p className="mb-6 text-body-md text-muted-foreground">
        Tente alterar os filtros ou buscar por outro nome.
      </p>
      <button type="button" onClick={onClear} className={buttonVariants({ variant: "outline" })}>
        Limpar filtros
      </button>
    </section>
  );
}

export function BoardsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="flex flex-col items-center py-20 text-center" role="alert">
      <CircleAlert className="mb-5 size-12 text-destructive" aria-hidden />
      <h2 className="mb-2 text-headline-md font-bold">Não foi possível carregar seus boards.</h2>
      <p className="mb-6 text-body-md text-muted-foreground">
        Verifique sua conexão e tente novamente.
      </p>
      <button type="button" onClick={onRetry} className={buttonVariants({ variant: "outline" })}>
        Tentar novamente
      </button>
    </section>
  );
}
