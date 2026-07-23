import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { BoardMember } from "@/features/boards/types/board.types";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function BoardMembers({ members, limit = 4 }: { members: BoardMember[]; limit?: number }) {
  const visible = members.slice(0, limit);
  const hidden = Math.max(0, members.length - visible.length);
  return (
    <AvatarGroup aria-label={`${members.length} membros ativos`}>
      {visible.map((member) => (
        <Tooltip key={member.id}>
          <TooltipTrigger render={<Avatar />}>
            {member.user.avatarUrl ? <AvatarImage src={member.user.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
          </TooltipTrigger>
          <TooltipContent>
            {member.user.name} — {member.role === "ADMIN" ? "Administrador" : "Colaborador"}
          </TooltipContent>
        </Tooltip>
      ))}
      {hidden ? (
        <AvatarGroupCount aria-label={`Mais ${hidden} membros`}>+{hidden}</AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}
