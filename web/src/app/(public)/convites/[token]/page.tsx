import type { Metadata } from "next";
import { BoardInvitationLayout } from "@/components/invitations/board-invitation-page";

export const metadata: Metadata = { title: "Convite para board" };

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <BoardInvitationLayout token={token} />;
}
