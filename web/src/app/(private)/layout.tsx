import type { ReactNode } from "react";
import { Suspense } from "react";
import { PrivateRouteGuard } from "@/components/auth/auth-guards";
import { NotificationsProvider } from "@/providers/notifications-provider";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PrivateRouteGuard>
        <NotificationsProvider>{children}</NotificationsProvider>
      </PrivateRouteGuard>
    </Suspense>
  );
}
