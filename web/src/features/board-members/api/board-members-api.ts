import type {
  BoardMemberListItem,
  InviteBoardMemberInput,
  RemoveBoardMemberInput,
} from "@/features/board-members/types/board-member.types";
import { api } from "@/lib/axios";

export async function listBoardMembers(boardId: string): Promise<BoardMemberListItem[]> {
  const response = await api.get<BoardMemberListItem[]>(
    `/boards/${encodeURIComponent(boardId)}/members`,
  );
  return response.data;
}

export async function inviteBoardMember(
  input: InviteBoardMemberInput,
): Promise<BoardMemberListItem> {
  const response = await api.post<BoardMemberListItem>(
    `/boards/${encodeURIComponent(input.boardId)}/invitations`,
    { email: input.email },
  );
  return response.data;
}

export async function removeBoardMember(input: RemoveBoardMemberInput): Promise<void> {
  await api.delete(
    `/boards/${encodeURIComponent(input.boardId)}/members/${encodeURIComponent(input.memberId)}`,
  );
}
