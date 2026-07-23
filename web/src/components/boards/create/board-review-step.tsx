import { LayoutDashboard, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { CreateBoardFormValues } from "@/features/boards/types/create-board.types";

export function BoardReviewStep({
  values,
  owner,
}: {
  values: CreateBoardFormValues;
  owner: { name: string; email: string; avatarUrl: string | null };
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 id="create-board-step-title" tabIndex={-1} className="text-headline-md font-bold">
          Revisar Novo Board
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Verifique os detalhes antes de finalizar a criação.
        </p>
      </div>
      <section className="space-y-2" aria-labelledby="review-identity">
        <h3
          id="review-identity"
          className="font-label text-label-sm uppercase tracking-wider text-muted-foreground"
        >
          Identidade do Board
        </h3>
        <div className="flex items-center gap-4 rounded-lg border bg-muted/40 p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <LayoutDashboard aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-label text-label-md">{values.name}</p>
            <p className="text-body-sm text-muted-foreground">
              {values.description || "Sem descrição."}
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-2" aria-labelledby="review-columns">
        <h3
          id="review-columns"
          className="font-label text-label-sm uppercase tracking-wider text-muted-foreground"
        >
          Fluxo de trabalho · {values.columns.length}{" "}
          {values.columns.length === 1 ? "coluna" : "colunas"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {values.columns.map((column, index) => (
            <Badge
              key={column.id}
              variant={index === 0 ? "info" : "outline"}
              className="normal-case"
            >
              <span className="size-2 rounded-full bg-current opacity-70" aria-hidden />
              {column.name}
            </Badge>
          ))}
        </div>
      </section>
      <section className="space-y-2" aria-labelledby="review-members">
        <h3
          id="review-members"
          className="font-label text-label-sm uppercase tracking-wider text-muted-foreground"
        >
          Membros e permissões · {values.memberEmails.length + 1} total
        </h3>
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg">
              {owner.avatarUrl ? <AvatarImage src={owner.avatarUrl} alt="" /> : null}
              <AvatarFallback>
                {owner.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-label text-label-md">{owner.name} (Você)</p>
              <p className="truncate text-body-sm text-muted-foreground">{owner.email}</p>
            </div>
          </div>
          <Badge variant="info" className="normal-case">
            Proprietário
          </Badge>
        </div>
        {values.memberEmails.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-body-sm text-muted-foreground">
            <UserRound className="size-5" aria-hidden />
            Nenhum convidado será adicionado agora.
          </div>
        ) : (
          values.memberEmails.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-label text-label-md">{email}</p>
                <p className="text-body-sm text-muted-foreground">Convite pendente</p>
              </div>
              <Badge variant="secondary" className="normal-case">
                Colaborador
              </Badge>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
