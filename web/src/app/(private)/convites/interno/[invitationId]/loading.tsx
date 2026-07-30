import { BoardInvitationLoading } from "@/components/invitations/board-invitation-loading";

export default function LoadingInternalInvitationPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <BoardInvitationLoading />
    </main>
  );
}
