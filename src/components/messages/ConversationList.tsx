"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface ConversationSummary {
  id: string;
  subject: string | null;
  otherParticipants: { id: string; name: string | null; email: string }[];
  lastMessage: {
    content: string;
    senderName: string | null;
    createdAt: Date;
  } | null;
  unread: boolean;
}

interface Props {
  conversations: ConversationSummary[];
}

export function ConversationList({ conversations }: Props) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <p className="text-sm text-gray-400 p-4">
        No conversations yet.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {conversations.map((conv) => {
        const name =
          conv.otherParticipants.map((p) => p.name ?? p.email).join(", ") ||
          "Unknown";
        const isActive = pathname === `/dashboard/messages/${conv.id}`;

        return (
          <li key={conv.id}>
            <Link
              href={`/dashboard/messages/${conv.id}`}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition ${
                isActive ? "bg-indigo-50" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      conv.unread ? "font-semibold text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {name}
                  </p>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.lastMessage.content}
                  </p>
                )}
              </div>
              {conv.unread && (
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
