"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { sendMessage, markConversationRead } from "@/actions/messages";
import { format } from "date-fns";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  createdAt: Date | string;
  sender: { id: string; name: string | null; image: string | null };
}

interface Props {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
}: Props) {
  const { messages } = useRealtimeMessages(conversationId, initialMessages as never);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId]);

  async function handleSend() {
    if (!content.trim() || sending) return;
    setSending(true);
    await sendMessage({ conversationId, content });
    setContent("");
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender.id === currentUserId;
          const time = format(new Date(msg.createdAt), "h:mm a");

          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium shrink-0">
                {(msg.sender.name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div
                className={`max-w-xs lg:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-900 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400">{time}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="flex-1 border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={sending || !content.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
