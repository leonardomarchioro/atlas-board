import { AppHeader } from "@/components/layout/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateBoardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Criar Board" />
      <main className="atlas-container flex min-h-screen items-start justify-center pb-8 pt-24 sm:items-center sm:py-24">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-card shadow-overlay">
          <div className="space-y-5 border-b p-6">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-52" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="size-9 rounded-md" />
            </div>
            <div className="flex justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
          <div className="flex justify-between border-t bg-muted/30 p-6">
            <Skeleton className="h-10 w-24" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
