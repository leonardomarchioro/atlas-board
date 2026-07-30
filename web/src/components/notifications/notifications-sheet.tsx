"use client";

import {
  Bell,
  CheckCheck,
  MessageSquare,
  MoveRight,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getNotificationHref } from "@/features/notifications/get-notification-href";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/features/notifications/notification-hooks";
import type {
  AtlasNotification,
  NotificationType,
} from "@/features/notifications/notification.types";
import { formatRelativeDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const notificationConfig: Record<
  NotificationType,
  { icon: LucideIcon; iconClassName: string }
> = {
  BOARD_INVITATION_RECEIVED: {
    icon: UserPlus,
    iconClassName: "bg-info-soft text-info-foreground",
  },
  TASK_ASSIGNED: {
    icon: UserCheck,
    iconClassName: "bg-success-soft text-success-foreground",
  },
  TASK_MOVED: {
    icon: MoveRight,
    iconClassName: "bg-warning-soft text-warning-foreground",
  },
  TASK_COMMENT_CREATED: {
    icon: MessageSquare,
    iconClassName: "bg-primary/10 text-primary",
  },
};

function visualConfig(type: string) {
  return notificationConfig[type as NotificationType] ?? {
    icon: Bell,
    iconClassName: "bg-muted text-muted-foreground",
  };
}

export function NotificationsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useNotifications(open);
  const unread = useUnreadNotificationsCount();
  const markAll = useMarkAllNotificationsAsRead();
  const notifications = query.data?.pages.flatMap((page) => page.data) ?? [];
  const unreadCount = unread.data?.count ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="shrink-0 border-b bg-surface-low px-5 py-5 pl-16">
          <SheetHeader className="gap-3">
            <SheetTitle className="text-headline-md">Notificações</SheetTitle>
            <SheetDescription className="sr-only">
              Suas notificações recentes do Atlas.
            </SheetDescription>
            {unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-fit self-start text-primary"
                disabled={markAll.isPending}
                onClick={() =>
                  markAll.mutate(undefined, {
                    onError: () => toast.error("Não foi possível marcar todas como lidas."),
                  })
                }
              >
                <CheckCheck aria-hidden />
                Marcar todas como lidas
              </Button>
            ) : null}
          </SheetHeader>
        </div>

        <div className="border-b px-6 py-3">
          <p className="font-label text-label-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Recentes
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {query.isPending ? (
            <NotificationsSkeleton />
          ) : query.isError ? (
            <NotificationsError onRetry={() => void query.refetch()} />
          ) : notifications.length === 0 ? (
            <NotificationsEmpty />
          ) : (
            <ul aria-label="Lista de notificações" className="divide-y">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    close={() => onOpenChange(false)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {query.hasNextPage ? (
          <div className="shrink-0 border-t bg-surface-low p-4">
            <Button
              variant="outline"
              className="w-full"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? "Carregando..." : "Carregar mais"}
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function NotificationItem({
  notification,
  close,
}: {
  notification: AtlasNotification;
  close: () => void;
}) {
  const router = useRouter();
  const markRead = useMarkNotificationAsRead();
  const unread = notification.readAt === null;
  const href = getNotificationHref(notification);
  const config = visualConfig(notification.type);
  const Icon = config.icon;

  const openNotification = () => {
    if (unread) {
      markRead.mutate(notification.id, {
        onError: () => toast.error("Não foi possível marcar a notificação como lida."),
      });
    }
    if (href) {
      close();
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "group relative flex w-full gap-4 px-6 py-5 text-left outline-none transition-colors hover:bg-surface-low focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        unread ? "bg-primary/[0.045]" : "text-muted-foreground",
      )}
      onClick={openNotification}
      aria-label={`${notification.title}. ${unread ? "Não lida." : "Lida."}${href ? "" : " Sem destino disponível."}`}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          config.iconClassName,
        )}
        aria-hidden
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-body-md text-foreground", unread && "font-semibold")}>
          {notification.title}
        </span>
        <span className="mt-1 block text-body-sm leading-relaxed text-muted-foreground">
          {notification.message}
        </span>
        <time
          dateTime={notification.createdAt}
          className="mt-2 block font-label text-label-sm text-muted-foreground"
        >
          {formatRelativeDate(notification.createdAt)}
        </time>
        {unread ? <span className="sr-only">Não lida. Marcar como lida.</span> : null}
      </span>
      {unread ? (
        <span
          className="mt-2 size-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/10"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="divide-y" role="status" aria-label="Carregando notificações">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="flex gap-4 px-6 py-5" key={index}>
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsEmpty() {
  return (
    <div className="grid min-h-full place-items-center px-8 py-16 text-center">
      <div>
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <Bell className="size-6 text-muted-foreground" aria-hidden />
        </span>
        <h3 className="mt-4 font-semibold">Nenhuma notificação</h3>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Quando houver novidades nos seus boards e tarefas, elas aparecerão aqui.
        </p>
      </div>
    </div>
  );
}

function NotificationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-full place-items-center px-8 py-16 text-center" role="alert">
      <div>
        <p className="text-body-sm text-muted-foreground">
          Não foi possível carregar suas notificações.
        </p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
