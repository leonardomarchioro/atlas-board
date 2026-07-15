import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { InviteMailService, SendBoardInviteInput } from "./invite-mail.service";

@Injectable()
export class MockInviteMailService implements InviteMailService {
  private readonly logger = new Logger(MockInviteMailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendInvite(input: SendBoardInviteInput): Promise<void> {
    const frontendUrl = this.configService
      .getOrThrow<string>("FRONTEND_URL")
      .replace(/\/+$/, "");
    const inviteUrl = `${frontendUrl}/convites/${encodeURIComponent(input.inviteToken)}`;

    this.logger.log(
      [
        "Convite para board gerado.",
        `Board: ${input.boardName}`,
        `Destinatário: ${input.email}`,
        `Link: ${inviteUrl}`,
        `Expira em: ${input.inviteExpiresAt.toISOString()}`,
      ].join("\n"),
    );
  }
}
