"use client";
import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/providers/auth-provider";

function LoadingSession() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-background"
      role="status"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" aria-hidden />
        Verificando sua sessão...
      </div>
    </main>
  );
}

export function PublicRouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);
  if (isLoading || isAuthenticated) return <LoadingSession />;
  return children;
}

export function PrivateRouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const current = search.size
        ? `${pathname}?${search.toString()}`
        : pathname;
      router.replace(`/login?redirect=${encodeURIComponent(current)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router, search]);
  if (isLoading || !isAuthenticated) return <LoadingSession />;
  return children;
}
