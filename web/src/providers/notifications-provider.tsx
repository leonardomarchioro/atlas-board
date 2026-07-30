"use client";

import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";

import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { env } from "@/config/env";
import { notificationKeys } from "@/features/notifications/notification.keys";
import { getNotificationHref } from "@/features/notifications/get-notification-href";
import type {
  AtlasNotification,
  NotificationsPage,
  UnreadCount,
} from "@/features/notifications/notification.types";
import { useAuth } from "@/providers/auth-provider";

type NotificationsContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function containsNotification(
  cache: InfiniteData<NotificationsPage, number> | undefined,
  id: string,
) {
  return cache?.pages.some((page) => page.data.some((item) => item.id === id)) ?? false;
}

function prependNotification(
  cache: InfiniteData<NotificationsPage, number> | undefined,
  notification: AtlasNotification,
) {
  if (!cache || containsNotification(cache, notification.id)) return cache;
  const [first, ...rest] = cache.pages;
  if (!first) return cache;
  return {
    ...cache,
    pages: [
      {
        ...first,
        data: [notification, ...first.data],
        pagination: { ...first.pagination, total: first.pagination.total + 1 },
      },
      ...rest,
    ],
  };
}

function getTokenExpiration(token: string): number | null {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;
    const payload: unknown = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")));
    if (
      typeof payload === "object" &&
      payload !== null &&
      "exp" in payload &&
      typeof payload.exp === "number"
    ) {
      return payload.exp * 1_000;
    }
  } catch {
    return null;
  }
  return null;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { accessToken, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const receivedIds = useRef(new Set<string>());

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) return;

    const sessionReceivedIds = receivedIds.current;
    const socket: Socket = io(`${env.NEXT_PUBLIC_API_URL}/notifications`, {
      auth: { token: accessToken },
    });
    socket.on("notification:new", (notification: AtlasNotification) => {
      const listKey = notificationKeys.list();
      const cache = queryClient.getQueryData<InfiniteData<NotificationsPage, number>>(listKey);
      if (sessionReceivedIds.has(notification.id) || containsNotification(cache, notification.id)) {
        return;
      }
      sessionReceivedIds.add(notification.id);
      queryClient.setQueryData<InfiniteData<NotificationsPage, number>>(listKey, (current) =>
        prependNotification(current, notification),
      );
      if (notification.readAt === null) {
        queryClient.setQueryData<UnreadCount>(notificationKeys.unreadCount(), (current) => ({
          count: (current?.count ?? 0) + 1,
        }));
      }

      const href = getNotificationHref(notification);
      toast(notification.title, {
        description: notification.message,
        action: href
          ? {
              label: "Abrir",
              onClick: () => router.push(href),
            }
          : undefined,
      });
    });

    socket.on("connect", () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    });

    const expiration = getTokenExpiration(accessToken);
    const refreshTimer =
      expiration === null
        ? undefined
        : window.setTimeout(
            () => {
              socket.disconnect();
              void queryClient.refetchQueries({
                queryKey: notificationKeys.unreadCount(),
                type: "active",
              });
            },
            Math.max(0, expiration - Date.now() - 5_000),
          );

    return () => {
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      socket.removeAllListeners();
      socket.disconnect();
      sessionReceivedIds.clear();
    };
  }, [accessToken, isAuthenticated, queryClient, router, user]);

  const value = useMemo(
    () => ({ open, setOpen, openNotifications: () => setOpen(true) }),
    [open],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationsSheet open={open} onOpenChange={setOpen} />
    </NotificationsContext.Provider>
  );
}

export function useNotificationsPanel() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificationsPanel deve ser usado dentro de NotificationsProvider.");
  }
  return context;
}
