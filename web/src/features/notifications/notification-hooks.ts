"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { notificationKeys } from "@/features/notifications/notification.keys";
import {
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/notifications-api";
import type {
  AtlasNotification,
  NotificationsPage,
  UnreadCount,
} from "@/features/notifications/notification.types";

type ListCache = InfiniteData<NotificationsPage, number>;

function updateNotification(
  cache: ListCache | undefined,
  id: string,
  readAt: string,
): ListCache | undefined {
  if (!cache) return cache;
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      data: page.data.map((item) => (item.id === id ? { ...item, readAt } : item)),
    })),
  };
}

export function useNotifications(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => listNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    enabled,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationsCount,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationKeys.list() }),
        queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
      ]);
      const previousList = queryClient.getQueryData<ListCache>(notificationKeys.list());
      const previousCount = queryClient.getQueryData<UnreadCount>(notificationKeys.unreadCount());
      const now = new Date().toISOString();
      queryClient.setQueryData<ListCache>(notificationKeys.list(), (cache) =>
        updateNotification(cache, id, now),
      );
      queryClient.setQueryData<UnreadCount>(notificationKeys.unreadCount(), (current) => ({
        count: Math.max(0, (current?.count ?? 0) - 1),
      }));
      return { previousList, previousCount };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(notificationKeys.list(), context?.previousList);
      queryClient.setQueryData(notificationKeys.unreadCount(), context?.previousCount);
    },
    onSuccess: (notification) => {
      queryClient.setQueryData<ListCache>(notificationKeys.list(), (cache) =>
        updateNotification(cache, notification.id, notification.readAt ?? new Date().toISOString()),
      );
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationKeys.list() }),
        queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
      ]);
      const previousList = queryClient.getQueryData<ListCache>(notificationKeys.list());
      const previousCount = queryClient.getQueryData<UnreadCount>(notificationKeys.unreadCount());
      const now = new Date().toISOString();
      queryClient.setQueryData<ListCache>(notificationKeys.list(), (cache) => {
        if (!cache) return cache;
        return {
          ...cache,
          pages: cache.pages.map((page) => ({
            ...page,
            data: page.data.map((item: AtlasNotification) => ({ ...item, readAt: now })),
          })),
        };
      });
      queryClient.setQueryData<UnreadCount>(notificationKeys.unreadCount(), { count: 0 });
      return { previousList, previousCount };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(notificationKeys.list(), context?.previousList);
      queryClient.setQueryData(notificationKeys.unreadCount(), context?.previousCount);
    },
  });
}
