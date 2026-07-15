import { createHash, randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";

import {
  GeneratedInvitationToken,
  InvitationTokenService,
} from "./invitation-token.service";

@Injectable()
export class CryptoInvitationTokenService implements InvitationTokenService {
  generate(): GeneratedInvitationToken {
    const token = randomBytes(32).toString("hex");
    return { token, tokenHash: this.hash(token) };
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
