import { Injectable, Logger } from "@nestjs/common";

import { InviteMailService, SendBoardInviteInput } from "./invite-mail.service";

@Injectable()
export class MockInviteMailService implements InviteMailService {
  private readonly logger = new Logger(MockInviteMailService.name);

  async sendInvite(input: SendBoardInviteInput): Promise<void> {
    this.logger.log(
      [
        "Convite de board enviado.",
        `Board: ${input.boardName}`,
        `Destinatário: ${input.email}`,
        `Link: http://localhost:3000/invites/${input.inviteToken}`,
        `Expira em: ${input.inviteExpiresAt.toISOString()}`,
      ].join("\n"),
    );
  }
}
