export type GeneratedInvitationToken = {
  token: string;
  tokenHash: string;
};

export abstract class InvitationTokenService {
  abstract generate(): GeneratedInvitationToken;
  abstract hash(token: string): string;
}
