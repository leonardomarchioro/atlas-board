import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import type { InvitationPerson } from "@/features/board-invitations/types/board-invitation.types";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function BoardInvitationMembers({
  members,
  membersCount,
}: {
  members: InvitationPerson[];
  membersCount: number;
}) {
  const hiddenCount = Math.max(0, membersCount - members.length);
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-surface-low p-4 sm:flex-row sm:items-center">
      <AvatarGroup aria-label={`Membros ativos: ${membersCount}`}>
        {members.map((member) => (
          <Avatar key={member.id} size="lg">
            {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
            <AvatarFallback aria-label={member.name}>
              {initials(member.name) || "AT"}
            </AvatarFallback>
          </Avatar>
        ))}
        {hiddenCount > 0 ? (
          <AvatarGroupCount aria-label={`Mais ${hiddenCount} membros`}>
            +{hiddenCount}
          </AvatarGroupCount>
        ) : null}
      </AvatarGroup>
      <p className="text-body-sm text-muted-foreground">
        {membersCount === 0 ? "Ainda não há membros ativos." : null}
        {membersCount > 0 ? (
          <>
            Junte-se a <span className="font-semibold text-foreground">{members[0]?.name}</span>
            {membersCount > 1 ? ` e outros ${membersCount - 1} membros` : " neste board"}
          </>
        ) : null}
      </p>
    </div>
  );
}
