"use client";

import axios from "axios";
import {
  ArrowRight,
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
import { BrandMark } from "@/components/brand-mark";
import { BoardInvitationLoading } from "@/components/invitations/board-invitation-loading";
import { BoardInvitationMembers } from "@/components/invitations/board-invitation-members";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLogout } from "@/features/auth/hooks/auth-hooks";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import { useAcceptBoardInvitation } from "@/features/board-invitations/hooks/use-accept-board-invitation";
import { useBoardInvitation } from "@/features/board-invitations/hooks/use-board-invitation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type ActionError =
  "email-mismatch" | "already-member" | "already-accepted" | "expired" | "unexpected";
const normalizeEmail = (value: string) => value.trim().toLowerCase();

function authUrls(token: string, email: string) {
  const invitationPath = `/convites/${token}`;
  return {
    login: `/login?${new URLSearchParams({ redirect: invitationPath })}`,
    register: `/cadastro?${new URLSearchParams({ redirect: invitationPath, email })}`,
  };
}

function formatDate(value: string | null) {
  if (!value) return "Sem data informada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(value),
  );
}

function StateCard({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <Card
      className="w-full max-w-2xl bg-card/90 p-4 text-center shadow-overlay backdrop-blur-xl"
      role="alert"
    >
      <CardContent className="flex flex-col items-center gap-5 py-8">
        <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-7" aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="text-headline-md">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {retry ? (
          <Button onClick={retry}>Tentar novamente</Button>
        ) : (
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Ir para a página inicial
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function BoardInvitationPage({ token }: { token: string }) {
  const invitationQuery = useBoardInvitation(token);
  const acceptMutation = useAcceptBoardInvitation();
  const logoutMutation = useLogout();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [acceptedBoardId, setAcceptedBoardId] = useState<string | null>(null);

  if (invitationQuery.isPending) return <BoardInvitationLoading />;
  if (invitationQuery.isError) {
    const status = axios.isAxiosError<ApiErrorResponse>(invitationQuery.error)
      ? invitationQuery.error.response?.status
      : undefined;
    if (status === 404 || status === 422)
      return (
        <StateCard
          title="Convite indisponível"
          description="Este convite não existe ou não está mais disponível."
        />
      );
    if (status === 410)
      return (
        <StateCard
          title="Este convite expirou"
          description="Solicite ao administrador do board um novo convite."
        />
      );
    return (
      <StateCard
        title="Não foi possível carregar o convite"
        description="Ocorreu um erro inesperado. Tente novamente."
        retry={() => void invitationQuery.refetch()}
      />
    );
  }

  const invitation = invitationQuery.data;
  const urls = authUrls(token, invitation.invitedEmail);
  const currentEmail = user?.email ?? "";
  const emailMatches = user
    ? normalizeEmail(user.email) === normalizeEmail(invitation.invitedEmail)
    : false;

  if (invitation.isExpired || actionError === "expired") {
    return (
      <StateCard
        title="Este convite expirou"
        description="Solicite ao administrador do board um novo convite."
      />
    );
  }

  async function accept() {
    if (acceptMutation.isPending || !emailMatches) return;
    setActionError(null);
    try {
      const result = await acceptMutation.mutateAsync(token);
      setAcceptedBoardId(result.board.id);
      window.setTimeout(
        () => router.replace(`/dashboard?${new URLSearchParams({ boardId: result.board.id })}`),
        900,
      );
    } catch (error) {
      const response = axios.isAxiosError<ApiErrorResponse>(error) ? error.response : undefined;
      const message = response?.data?.message;
      if (response?.status === 403 || response?.data?.code === "ACCESS_DENIED")
        setActionError("email-mismatch");
      else if (response?.status === 410 || response?.data?.code === "GONE")
        setActionError("expired");
      else if (response?.status === 409 && message === "Você já é membro deste board.")
        setActionError("already-member");
      else if (response?.status === 409) setActionError("already-accepted");
      else setActionError("unexpected");
    }
  }

  if (acceptedBoardId) {
    return (
      <Card
        className="w-full max-w-2xl bg-card/90 p-4 text-center shadow-overlay"
        role="status"
        aria-live="polite"
      >
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <CheckCircle2 className="size-14 text-success" aria-hidden />
          <h1 className="text-headline-md">Convite aceito com sucesso.</h1>
          <p className="text-muted-foreground">Redirecionando para seus boards...</p>
        </CardContent>
      </Card>
    );
  }

  const unavailable = invitation.status === "ACTIVE" || !invitation.canAccept;
  return (
    <Card className="w-full max-w-2xl gap-6 bg-card/90 p-2 shadow-overlay backdrop-blur-xl">
      <CardHeader className="gap-4">
        <StatusBadge tone={unavailable ? "success" : "info"}>
          {unavailable ? "Convite utilizado" : "Convite pendente"}
        </StatusBadge>
        <div className="space-y-2">
          <h1 className="text-headline-lg">
            Você foi convidado para participar de{" "}
            <span className="text-primary">{invitation.board.name}</span>
          </h1>
          <p className="max-w-xl text-muted-foreground">
            {invitation.board.description || "Este board não possui descrição."}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <BoardInvitationMembers
          members={invitation.board.members}
          membersCount={invitation.board.membersCount}
        />
        <dl className="grid gap-3 sm:grid-cols-2">
          <Info icon={UserRound} label="Convidado por" value={invitation.invitedBy.name} />
          <Info icon={Users} label="Função" value="Colaborador" />
          <Info icon={Mail} label="Convite enviado para" value={invitation.invitedEmail} breakAll />
          <Info icon={CalendarClock} label="Expira em" value={formatDate(invitation.expiresAt)} />
        </dl>
        {unavailable || actionError === "already-accepted" ? (
          <Notice
            title="Este convite já foi aceito."
            description="Acesse seus boards pelo dashboard."
          />
        ) : actionError === "already-member" ? (
          <Notice
            title="Você já faz parte deste board."
            description="O board está disponível entre os seus boards."
          />
        ) : !isAuthLoading && (!isAuthenticated || !user) ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={urls.login} className={cn(buttonVariants({ size: "lg" }), "h-12")}>
              Entrar para aceitar
              <ArrowRight aria-hidden />
            </Link>
            <Link
              href={urls.register}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12")}
            >
              Criar uma conta
            </Link>
          </div>
        ) : isAuthLoading ? (
          <div
            className="flex h-12 items-center justify-center gap-2 text-muted-foreground"
            role="status"
          >
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
            Verificando sua sessão...
          </div>
        ) : !emailMatches || actionError === "email-mismatch" ? (
          <div
            className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <div>
              <p className="font-semibold text-destructive">
                Este convite foi enviado para outro endereço de e-mail.
              </p>
              <p className="mt-2 break-all text-body-sm">Convite: {invitation.invitedEmail}</p>
              <p className="break-all text-body-sm">Conta atual: {currentEmail}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate(urls.login)}
            >
              {logoutMutation.isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : null}
              Sair e entrar com outra conta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-success-soft p-3 text-body-sm text-success-foreground">
              <ShieldCheck className="size-5 shrink-0" aria-hidden />
              <span>
                Você está conectado como: <strong className="break-all">{currentEmail}</strong>
              </span>
            </div>
            {actionError === "unexpected" ? (
              <p className="text-center text-body-sm text-destructive" role="alert">
                Não foi possível aceitar o convite. Tente novamente.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                className="h-12"
                disabled={acceptMutation.isPending}
                onClick={() => void accept()}
              >
                {acceptMutation.isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden />
                ) : null}
                {acceptMutation.isPending ? "Aceitando..." : "Aceitar convite"}
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
  breakAll = false,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-surface-low p-4">
      <dt className="flex items-center gap-2 font-label text-label-sm uppercase text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </dt>
      <dd className={cn("mt-1 font-medium", breakAll && "break-all")}>{value}</dd>
    </div>
  );
}

function Notice({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 text-center" role="status">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
      <Link href="/dashboard" className={cn(buttonVariants(), "mt-4")}>
        Ir para o dashboard
      </Link>
    </div>
  );
}

export function BoardInvitationLayout({ token }: { token: string }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]" />
      <header className="atlas-container relative z-10 flex items-center justify-between py-6">
        <Link
          href="/"
          aria-label="Atlas — página inicial"
          className="rounded-sm focus-visible:outline-2"
        >
          <BrandMark size="sm" />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
        <BoardInvitationPage token={token} />
      </main>
      <footer className="atlas-container relative z-10 py-6 text-center text-body-sm text-muted-foreground">
        © 2026 Atlas SaaS. Convites são vinculados ao e-mail informado.
      </footer>
    </div>
  );
}
