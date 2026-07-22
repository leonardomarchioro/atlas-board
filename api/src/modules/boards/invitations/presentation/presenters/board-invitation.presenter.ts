import type { BoardInvitationDetails } from "../selects/board-invitation.select";

export class BoardInvitationPresenter {
  static toHTTP(invitation: BoardInvitationDetails) {
    const isExpired =
      invitation.inviteExpiresAt !== null &&
      invitation.inviteExpiresAt.getTime() <= Date.now();

    return {
      board: {
        id: invitation.board.id,
        name: invitation.board.name,
        description: invitation.board.description,
        membersCount: invitation.board._count.members,
        members: invitation.board.members.flatMap(({ user }) =>
          user
            ? [{ id: user.id, name: user.name, avatarUrl: user.avatarUrl }]
            : [],
        ),
      },
      invitedEmail: invitation.email,
      role: invitation.role,
      status: invitation.status,
      invitedBy: invitation.board.createdBy,
      expiresAt: invitation.inviteExpiresAt,
      acceptedAt: invitation.acceptedAt,
      isExpired,
      canAccept:
        invitation.status === "PENDING" &&
        invitation.userId === null &&
        invitation.inviteExpiresAt !== null &&
        !isExpired,
    };
  }

  static toAcceptedHTTP(invitation: BoardInvitationDetails) {
    return {
      board: {
        id: invitation.board.id,
        name: invitation.board.name,
        description: invitation.board.description,
      },
      membership: {
        id: invitation.id,
        role: invitation.role,
        status: invitation.status,
        acceptedAt: invitation.acceptedAt,
      },
    };
  }
}
