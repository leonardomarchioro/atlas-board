import { Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { InviteMailService } from "@shared/mail/invite-mail.service";
import { DomainNotificationsService } from "@modules/notifications/application/domain-notifications.service";
import { BoardAccessService } from "../../services/board-access.service";
import {
  BoardMemberView,
  boardMemberSelect,
} from "../../presentation/selects/board-member.select";
import { BoardInvitationAlreadyExistsError } from "../errors/board-invitation-already-exists.error";
import { BoardMemberAlreadyExistsError } from "../errors/board-member-already-exists.error";
import { CannotInviteSelfError } from "../errors/cannot-invite-self.error";
import { InvitationTokenService } from "../services/invitation-token.service";

export interface InviteBoardMemberInput {
  boardId: string;
  currentUserId: string;
  currentUserEmail: string;
  email: string;
}

@Injectable()
export class InviteBoardMemberUseCase implements UseCase<
  InviteBoardMemberInput,
  BoardMemberView
> {
  private readonly logger = new Logger(InviteBoardMemberUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BoardAccessService,
    private readonly tokens: InvitationTokenService,
    private readonly mail: InviteMailService,
    private readonly notifications: DomainNotificationsService,
  ) {}

  async execute(input: InviteBoardMemberInput): Promise<BoardMemberView> {
    await this.access.requireActiveAdmin(input.boardId, input.currentUserId);
    const email = input.email.trim().toLowerCase();
    if (email === input.currentUserEmail.trim().toLowerCase()) {
      throw new CannotInviteSelfError();
    }

    const board = await this.prisma.board.findUniqueOrThrow({
      where: { id: input.boardId },
      select: { id: true, name: true },
    });
    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_email: { boardId: input.boardId, email } },
      select: {
        id: true,
        status: true,
        inviteExpiresAt: true,
      },
    });
    if (existing?.status === "ACTIVE") {
      throw new BoardMemberAlreadyExistsError(
        "Este e-mail já pertence a um membro ativo do board.",
      );
    }

    const now = new Date();
    if (
      existing?.status === "PENDING" &&
      existing.inviteExpiresAt &&
      existing.inviteExpiresAt > now
    ) {
      throw new BoardInvitationAlreadyExistsError();
    }

    const generated = this.tokens.generate();
    const inviteExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const member = existing
      ? await this.prisma.boardMember.update({
          where: { id: existing.id },
          data: {
            role: "COLLABORATOR",
            status: "PENDING",
            userId: null,
            acceptedAt: null,
            inviteTokenHash: generated.tokenHash,
            inviteExpiresAt,
          },
          select: boardMemberSelect,
        })
      : await this.prisma.boardMember.create({
          data: {
            boardId: input.boardId,
            email,
            role: "COLLABORATOR",
            status: "PENDING",
            inviteTokenHash: generated.tokenHash,
            inviteExpiresAt,
          },
          select: boardMemberSelect,
        });

    const invitedUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (invitedUser) {
      await this.notifications.boardInvitation({
        recipientUserId: invitedUser.id,
        actorUserId: input.currentUserId,
        boardId: board.id,
        boardName: board.name,
        invitationId: member.id,
      });
    }

    try {
      await this.mail.sendInvite({
        boardId: board.id,
        boardName: board.name,
        email,
        inviteToken: generated.token,
        inviteExpiresAt,
      });
    } catch {
      this.logger.error(`Falha ao enviar convite para ${email}.`);
    }
    return member;
  }
}
