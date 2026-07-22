import { BrandMark } from "@/components/brand-mark";
import { BoardInvitationLoading } from "@/components/invitations/board-invitation-loading";

export default function LoadingInvitationPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background p-4 sm:p-8">
      <BrandMark size="sm" />
      <div className="flex flex-1 items-center justify-center py-8">
        <BoardInvitationLoading />
      </div>
    </main>
  );
}
