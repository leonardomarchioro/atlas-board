import { CircleAlert, Columns3, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function BoardLoading() {
  return (
    <main
      className="min-h-screen bg-background p-4 pt-24 lg:p-8 lg:pt-24"
      role="status"
      aria-label="Carregando board"
    >
      <div className="space-y-5">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-20 w-full max-w-2xl" />
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-80 shrink-0 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function BoardErrorState({
  kind,
  onRetry,
}: {
  kind: "not-found" | "denied" | "unexpected";
  onRetry?: () => void;
}) {
  const content =
    kind === "not-found"
      ? {
          icon: Columns3,
          title: "Board não encontrado.",
          description: "O board pode ter sido removido ou o endereço está incorreto.",
        }
      : kind === "denied"
        ? {
            icon: LockKeyhole,
            title: "Você não possui acesso a este board.",
            description: "Somente membros ativos podem visualizar este conteúdo.",
          }
        : {
            icon: CircleAlert,
            title: "Não foi possível carregar o board.",
            description: "Ocorreu um erro inesperado. Tente novamente.",
          };
  const Icon = content.icon;
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4" role="alert">
      <div className="max-w-md text-center">
        <Icon className="mx-auto mb-5 size-12 text-destructive" aria-hidden />
        <h1 className="text-headline-md">{content.title}</h1>
        <p className="mt-2 text-muted-foreground">{content.description}</p>
        <div className="mt-6 flex justify-center gap-3">
          {kind === "unexpected" && onRetry ? (
            <Button onClick={onRetry}>Tentar novamente</Button>
          ) : null}
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Voltar para meus boards
          </Link>
        </div>
      </div>
    </main>
  );
}

export function BoardWithoutColumns({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="grid flex-1 place-items-center p-6 text-center">
      <div>
        <Columns3 className="mx-auto mb-4 size-12 text-muted-foreground" aria-hidden />
        <h2 className="text-headline-md">Este board ainda não possui colunas.</h2>
        <p className="mt-2 text-muted-foreground">
          {isAdmin
            ? "A criação de colunas ainda não está disponível nesta tela."
            : "Solicite a um administrador que configure o fluxo."}
        </p>
        {isAdmin ? (
          <Button className="mt-5" disabled>
            Criar coluna
          </Button>
        ) : null}
      </div>
    </div>
  );
}
