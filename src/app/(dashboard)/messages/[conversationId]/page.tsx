import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getConversations, getMessages } from "@/actions/messages";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { conversationId } = await params;

  const [conversations, messages] = await Promise.all([
    getConversations(),
    getMessages(conversationId),
  ]);

  if (!conversations.some((c) => c.id === conversationId)) notFound();

  const current = conversations.find((c) => c.id === conversationId)!;
  const otherName =
    current.otherParticipants.map((p) => p.name ?? p.email).join(", ") ||
    "Unknown";

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex gap-0 bg-white border rounded-xl overflow-hidden">
      <div className="w-72 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Messages</h2>
        </div>
        <ConversationList conversations={conversations} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b">
          <p className="font-medium text-gray-900">{otherName}</p>
          {current.subject && (
            <p className="text-xs text-gray-400">{current.subject}</p>
          )}
        </div>
        <MessageThread
          conversationId={conversationId}
          initialMessages={messages}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
