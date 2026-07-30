import type { Metadata } from "next";

import { InternalBoardInvitationPage } from "@/components/invitations/internal-board-invitation-page";

export const metadata: Metadata = { title: "Convite para board" };

export default async function InternalInvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  return <InternalBoardInvitationPage invitationId={invitationId} />;
}
