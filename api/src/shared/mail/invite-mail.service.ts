export interface SendBoardInviteInput {
  boardId: string;
  boardName: string;
  email: string;
  inviteToken: string;
  inviteExpiresAt: Date;
}

export abstract class InviteMailService {
  abstract sendInvite(input: SendBoardInviteInput): Promise<void>;
}
