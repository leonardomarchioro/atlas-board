import type { BoardMemberView } from "../selects/board-member.select";

export class BoardMemberPresenter {
  static toHTTP(member: BoardMemberView) {
    return {
      id: member.id,
      email: member.email,
      role: member.role,
      status: member.status,
      joinedAt: member.acceptedAt,
      inviteExpiresAt: member.inviteExpiresAt,
      user: member.user,
    };
  }
}
