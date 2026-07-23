import type { BoardMemberView } from "../selects/board-member.select";

export class BoardMemberPresenter {
  static toHTTP(member: BoardMemberView) {
    return {
      id: member.id,
      email: member.email,
      isOwner: member.userId === member.board.createdById,
      role: member.role,
      status: member.status,
      joinedAt: member.acceptedAt,
      createdAt: member.createdAt,
      inviteExpiresAt: member.inviteExpiresAt,
      user: member.user,
    };
  }
}
