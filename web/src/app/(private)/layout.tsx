import type { ReactNode } from "react";
import { Suspense } from "react";
import { PrivateRouteGuard } from "@/components/auth/auth-guards";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PrivateRouteGuard>{children}</PrivateRouteGuard>
    </Suspense>
  );
}
