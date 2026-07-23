import { Mail, Plus, Trash2 } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function BoardMembersStep({
  owner,
  emails,
  draft,
  draftError,
  disabled,
  onDraftChange,
  onAdd,
  onRemove,
}: {
  owner: { name: string; email: string; avatarUrl: string | null };
  emails: string[];
  draft: string;
  draftError: string | null;
  disabled: boolean;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (email: string) => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onAdd();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 id="create-board-step-title" tabIndex={-1} className="text-headline-md font-bold">
          Convidar Membros
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Adicione pessoas para colaborar. Esta etapa é opcional.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="member-email">E-mail do convidado</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Mail
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="member-email"
              type="email"
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite o e-mail..."
              className="pl-9"
              disabled={disabled}
              aria-invalid={Boolean(draftError)}
              aria-describedby={draftError ? "member-email-error" : "member-email-help"}
            />
          </div>
          <Button type="button" onClick={onAdd} disabled={disabled || !draft.trim()}>
            <Plus aria-hidden />
            Adicionar
          </Button>
        </div>
        {draftError ? (
          <p id="member-email-error" className="text-body-sm text-destructive" role="alert">
            {draftError}
          </p>
        ) : (
          <p id="member-email-help" className="text-body-sm text-muted-foreground">
            Um convite será gerado para cada e-mail informado.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <p className="font-label text-label-md">
          Membros <span className="text-muted-foreground">({emails.length + 1})</span>
        </p>
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg">
              {owner.avatarUrl ? <AvatarImage src={owner.avatarUrl} alt="" /> : null}
              <AvatarFallback className="bg-primary/10 text-primary">
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
        {emails.map((email) => (
          <div
            key={email}
            className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initialsFromEmail(email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-label text-label-md">{email}</p>
                <p className="text-body-sm text-muted-foreground">Convite pendente</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(email)}
              disabled={disabled}
              aria-label={`Remover convite para ${email}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
