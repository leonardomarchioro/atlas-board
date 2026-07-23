import type { BoardRole } from "@/features/boards/types/board.types";

export interface BoardMemberListItem {
  id: string;
  email: string;
  isOwner: boolean;
  role: BoardRole;
  status: "ACTIVE" | "PENDING";
  joinedAt: string | null;
  createdAt: string;
  inviteExpiresAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export interface InviteBoardMemberInput {
  boardId: string;
  email: string;
}

export interface RemoveBoardMemberInput {
  boardId: string;
  memberId: string;
}
