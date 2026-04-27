import { create } from "zustand";

interface MessageStore {
  unreadCounts: Record<string, number>;
  setUnread: (conversationId: string, count: number) => void;
  clearUnread: (conversationId: string) => void;
  totalUnread: () => number;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  unreadCounts: {},
  setUnread: (conversationId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: count },
    })),
  clearUnread: (conversationId) =>
    set((state) => {
      const counts = { ...state.unreadCounts };
      delete counts[conversationId];
      return { unreadCounts: counts };
    }),
  totalUnread: () => Object.values(get().unreadCounts).reduce((a, b) => a + b, 0),
}));
