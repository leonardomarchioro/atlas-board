"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUnreadNotificationsCount } from "@/features/notifications/notification-hooks";
import { useNotificationsPanel } from "@/providers/notifications-provider";

export function NotificationTrigger({ sidebar = false }: { sidebar?: boolean }) {
  const { openNotifications } = useNotificationsPanel();
  const unread = useUnreadNotificationsCount();
  const count = unread.data?.count ?? 0;
  const label = count > 99 ? "99+" : String(count);

  return (
    <Button
      type="button"
      variant="ghost"
      size={sidebar ? "default" : "icon"}
      className={
        sidebar
          ? "h-10 w-full justify-start gap-4 px-1"
          : "relative rounded-full"
      }
      aria-label="Notificações"
      onClick={openNotifications}
    >
      <span className={sidebar ? "relative grid size-8 shrink-0 place-items-center" : undefined}>
        <Bell aria-hidden />
        {count > 0 ? (
          <span
            className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-5 text-primary-foreground ring-2 ring-background"
            aria-hidden
          >
            {label}
          </span>
        ) : null}
      </span>
      {sidebar ? (
        <span className="whitespace-nowrap opacity-0 transition-opacity group-hover/sidebar:opacity-100">
          Notificações
        </span>
      ) : null}
      {count > 0 ? (
        <>
          <span className="sr-only">
            {count > 99 ? "Mais de 99" : count} notificações não lidas
          </span>
        </>
      ) : null}
    </Button>
  );
}
