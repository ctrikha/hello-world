import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/actions/messages";
import { ConversationList } from "@/components/messages/ConversationList";

export default async function MessagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const conversations = await getConversations();

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No messages yet. Your advisor will initiate contact when assigned.
          </div>
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </div>
    </div>
  );
}
