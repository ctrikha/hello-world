"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
}

export function useRealtimeMessages(
  conversationId: string,
  initialMessages: Message[]
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    // Only subscribe if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === "undefined"
    ) {
      return;
    }

    const supabase = createBrowserClient();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, setMessages };
}
