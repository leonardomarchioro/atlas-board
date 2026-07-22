import type { ReactNode } from "react";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PublicRouteGuard } from "@/components/auth/auth-guards";

export default function AuthenticationLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PublicRouteGuard>
        <AuthLayout>{children}</AuthLayout>
      </PublicRouteGuard>
    </Suspense>
  );
}
