"use client";

import axios from "axios";
import {
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { BoardInvitationLoading } from "@/components/invitations/board-invitation-loading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import { useAcceptAuthenticatedBoardInvitation } from "@/features/board-invitations/hooks/use-accept-authenticated-board-invitation";
import { useAuthenticatedBoardInvitation } from "@/features/board-invitations/hooks/use-authenticated-board-invitation";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) return "Sem data informada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InternalBoardInvitationPage({
  invitationId,
}: {
  invitationId: string;
}) {
  const invitationQuery = useAuthenticatedBoardInvitation(invitationId);
  const acceptMutation = useAcceptAuthenticatedBoardInvitation();
  const router = useRouter();
  const [acceptedBoardId, setAcceptedBoardId] = useState<string | null>(null);

  async function accept() {
    if (acceptMutation.isPending) return;
    try {
      const result = await acceptMutation.mutateAsync(invitationId);
      setAcceptedBoardId(result.board.id);
      toast.success("Convite aceito com sucesso.");
      window.setTimeout(() => router.replace(`/boards/${result.board.id}`), 700);
    } catch {
      toast.error("Não foi possível aceitar o convite.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader section="Convite para board" />
      <main className="atlas-container relative flex flex-1 items-center justify-center pb-10 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]" />
        <div className="relative z-10 flex w-full justify-center">
          {invitationQuery.isPending ? (
            <BoardInvitationLoading />
          ) : invitationQuery.isError ? (
            <InvitationErrorState
              error={invitationQuery.error}
              retry={() => void invitationQuery.refetch()}
            />
          ) : acceptedBoardId ? (
            <AcceptedState boardId={acceptedBoardId} />
          ) : (
            <InvitationCard
              invitation={invitationQuery.data}
              accepting={acceptMutation.isPending}
              acceptError={acceptMutation.isError}
              onAccept={() => void accept()}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function InvitationCard({
  invitation,
  accepting,
  acceptError,
  onAccept,
}: {
  invitation: NonNullable<
    ReturnType<typeof useAuthenticatedBoardInvitation>["data"]
  >;
  accepting: boolean;
  acceptError: boolean;
  onAccept: () => void;
}) {
  const active = invitation.status === "ACTIVE";
  const expired = invitation.isExpired;

  return (
    <Card className="w-full max-w-2xl gap-6 bg-card/95 p-2 shadow-overlay backdrop-blur-xl">
      <CardHeader className="gap-4">
        <StatusBadge tone={active ? "success" : expired ? "warning" : "info"}>
          {active ? "Convite aceito" : expired ? "Convite expirado" : "Convite pendente"}
        </StatusBadge>
        <div className="space-y-2">
          <h1 className="text-headline-lg">Você foi convidado</h1>
          <p className="text-body-md text-muted-foreground">
            <strong className="text-foreground">{invitation.invitedBy.name}</strong> convidou você
            para participar do board:
          </p>
          <h2 className="text-headline-md text-primary">{invitation.board.name}</h2>
          <p className="text-muted-foreground">
            {invitation.board.description || "Este board não possui descrição."}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Info icon={UserRound} label="Convidado por" value={invitation.invitedBy.name} />
          <Info icon={Users} label="Função" value="Colaborador" />
          <Info icon={Mail} label="E-mail convidado" value={invitation.email} />
          <Info icon={CalendarClock} label="Enviado em" value={formatDate(invitation.createdAt)} />
          <Info
            icon={CalendarClock}
            label={active ? "Aceito em" : "Expira em"}
            value={formatDate(active ? invitation.acceptedAt : invitation.expiresAt)}
          />
        </dl>

        {active ? (
          <Notice
            icon={CheckCircle2}
            title="Você já faz parte deste board."
            description="O convite já foi aceito e o board está disponível."
          >
            <Link href={`/boards/${invitation.board.id}`} className={buttonVariants()}>
              Abrir board
            </Link>
          </Notice>
        ) : expired ? (
          <Notice
            icon={TriangleAlert}
            title="Este convite expirou."
            description="Solicite ao administrador do board um novo convite."
          >
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
              Voltar ao dashboard
            </Link>
          </Notice>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-success-soft p-3 text-body-sm text-success-foreground">
              <ShieldCheck className="size-5 shrink-0" aria-hidden />
              Este convite foi validado para sua conta.
            </div>
            {acceptError ? (
              <p className="text-center text-body-sm text-destructive" role="alert">
                Não foi possível aceitar o convite. Tente novamente.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                className="h-12"
                disabled={accepting || !invitation.canAccept}
                onClick={onAccept}
              >
                {accepting ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                {accepting ? "Aceitando convite..." : "Aceitar convite"}
              </Button>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12")}
              >
                Agora não
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-surface-low p-4">
      <dt className="flex items-center gap-2 font-label text-label-sm uppercase text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 break-words font-medium">{value}</dd>
    </div>
  );
}

function Notice({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/50 p-5 text-center" role="status">
      <Icon className="mx-auto size-9 text-primary" aria-hidden />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function AcceptedState({ boardId }: { boardId: string }) {
  return (
    <Card className="w-full max-w-2xl bg-card/95 p-4 text-center shadow-overlay" role="status">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <CheckCircle2 className="size-14 text-success" aria-hidden />
        <h1 className="text-headline-md">Convite aceito com sucesso.</h1>
        <p className="text-muted-foreground">Abrindo o board...</p>
        <Link href={`/boards/${boardId}`} className={buttonVariants()}>
          Abrir agora
        </Link>
      </CardContent>
    </Card>
  );
}

function InvitationErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const status = axios.isAxiosError<ApiErrorResponse>(error)
    ? error.response?.status
    : undefined;
  const unavailable = status === 404 || status === 403 || status === 422;
  return (
    <Card className="w-full max-w-2xl bg-card/95 p-4 text-center shadow-overlay" role="alert">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <TriangleAlert className="size-12 text-destructive" aria-hidden />
        <h1 className="text-headline-md">
          {unavailable ? "Convite indisponível" : "Não foi possível carregar o convite"}
        </h1>
        <p className="text-muted-foreground">
          {unavailable
            ? "Este convite não existe ou não está vinculado à sua conta."
            : "Ocorreu um erro inesperado. Tente novamente."}
        </p>
        {unavailable ? (
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Voltar ao dashboard
          </Link>
        ) : (
          <Button onClick={retry}>Tentar novamente</Button>
        )}
      </CardContent>
    </Card>
  );
}
