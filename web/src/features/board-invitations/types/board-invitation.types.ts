export interface InvitationPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface BoardInvitationResponse {
  board: {
    id: string;
    name: string;
    description: string | null;
    membersCount: number;
    members: InvitationPerson[];
  };
  invitedEmail: string;
  role: "COLLABORATOR";
  status: "PENDING" | "ACTIVE";
  invitedBy: InvitationPerson;
  expiresAt: string | null;
  acceptedAt: string | null;
  isExpired: boolean;
  canAccept: boolean;
}

export interface AcceptBoardInvitationResponse {
  board: { id: string; name: string; description: string | null };
  membership: {
    id: string;
    role: "COLLABORATOR";
    status: "ACTIVE";
    acceptedAt: string;
  };
}

export interface AuthenticatedBoardInvitationResponse {
  id: string;
  board: { id: string; name: string; description: string | null };
  email: string;
  role: "COLLABORATOR";
  status: "PENDING" | "ACTIVE";
  invitedBy: InvitationPerson;
  createdAt: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  isExpired: boolean;
  canAccept: boolean;
}
