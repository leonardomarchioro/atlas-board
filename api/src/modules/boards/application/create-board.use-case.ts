import { Injectable, Logger } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
import { InviteMailService } from "@shared/mail/invite-mail.service";
import { InvitationTokenService } from "../invitations/services/invitation-token.service";
import { BoardMustHaveColumnError } from "../errors/board-must-have-column.error";
import {
  BoardDetails,
  boardDetailsSelect,
} from "../presentation/selects/board-details.select";

export interface CreateBoardInput {
  userId: string;
  userEmail: string;
  name: string;
  description?: string;
  columns: Array<{ name: string }>;
  memberEmails?: string[];
}

type CreatedBoard = {
  board: BoardDetails;
  invites: Array<{ email: string; token: string; inviteExpiresAt: Date }>;
};

@Injectable()
export class CreateBoardUseCase implements UseCase<
  CreateBoardInput,
  BoardDetails
> {
  private readonly logger = new Logger(CreateBoardUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inviteMailService: InviteMailService,
    private readonly invitationTokens: InvitationTokenService,
  ) {}

  async execute(input: CreateBoardInput): Promise<BoardDetails> {
    if (input.columns.length === 0) throw new BoardMustHaveColumnError();
    const name = input.name.trim();
    const description = input.description?.trim();
    const columns = input.columns.map((column, position) => ({
      name: column.name.trim(),
      position,
    }));
    if (!name || columns.some((column) => !column.name)) {
      throw new AppError(
        "O nome do board e das colunas não pode ser vazio.",
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const creatorEmail = input.userEmail.trim().toLowerCase();
    const normalizedEmails = (input.memberEmails ?? []).map((email) =>
      email.trim().toLowerCase(),
    );
    if (normalizedEmails.some((email) => email.length === 0)) {
      throw new AppError(
        "Os e-mails dos membros não podem ser vazios.",
        ErrorCode.VALIDATION_ERROR,
      );
    }
    const emails = [...new Set(normalizedEmails)].filter(
      (email) => email !== creatorEmail,
    );
    const now = new Date();
    const inviteExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const invites = emails.map((email) => ({
      email,
      ...this.invitationTokens.generate(),
      inviteExpiresAt,
    }));

    const created = await this.prisma.$transaction(
      async (tx): Promise<CreatedBoard> => {
        const board = await tx.board.create({
          data: { name, description, createdById: input.userId },
          select: { id: true },
        });
        await tx.boardMember.create({
          data: {
            boardId: board.id,
            userId: input.userId,
            email: creatorEmail,
            role: "ADMIN",
            status: "ACTIVE",
            acceptedAt: now,
          },
        });
        await tx.boardColumn.createMany({
          data: columns.map((column) => ({ ...column, boardId: board.id })),
        });
        if (invites.length > 0) {
          await tx.boardMember.createMany({
            data: invites.map((invite) => ({
              email: invite.email,
              inviteTokenHash: invite.tokenHash,
              inviteExpiresAt: invite.inviteExpiresAt,
              boardId: board.id,
              role: "COLLABORATOR",
              status: "PENDING",
            })),
          });
        }
        const details = await tx.board.findUniqueOrThrow({
          where: { id: board.id },
          select: boardDetailsSelect,
        });
        return { board: details, invites };
      },
    );

    const results = await Promise.allSettled(
      created.invites.map((invite) =>
        this.inviteMailService.sendInvite({
          boardId: created.board.id,
          boardName: created.board.name,
          email: invite.email,
          inviteToken: invite.token,
          inviteExpiresAt: invite.inviteExpiresAt,
        }),
      ),
    );
    results.forEach((result, index) => {
      if (result.status === "rejected")
        this.logger.error(
          `Falha ao enviar convite para ${created.invites[index].email}.`,
        );
    });
    return created.board;
  }
}
