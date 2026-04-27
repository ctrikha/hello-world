"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createConversation(params: {
  participantId: string;
  subject?: string;
}) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  // Check if conversation already exists between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: params.participantId } } },
      ],
    },
  });

  if (existing) return { conversation: existing };

  const conversation = await prisma.conversation.create({
    data: {
      subject: params.subject,
      participants: {
        create: [
          { userId: session.user.id },
          { userId: params.participantId },
        ],
      },
    },
  });

  return { conversation };
}

export async function sendMessage(params: {
  conversationId: string;
  content: string;
  attachmentUrl?: string;
}) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  if (!params.content.trim()) return { error: "Message cannot be empty" };

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: params.conversationId,
        userId: session.user.id,
      },
    },
  });
  if (!participant) return { error: "Not a conversation participant" };

  const message = await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      senderId: session.user.id,
      content: params.content.trim(),
      attachmentUrl: params.attachmentUrl,
    },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: { updatedAt: new Date() },
  });

  return { message };
}

export async function markConversationRead(conversationId: string) {
  const session = await auth();
  if (!session) return;

  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
    data: { lastReadAt: new Date() },
  });
}

export async function getConversations() {
  const session = await auth();
  if (!session) return [];

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { name: true } } },
          },
          participants: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return participants.map((p) => {
    const conv = p.conversation;
    const otherParticipants = conv.participants
      .filter((pp) => pp.userId !== session.user.id)
      .map((pp) => pp.user);
    const lastMsg = conv.messages[0];
    const unread =
      lastMsg &&
      (!p.lastReadAt || lastMsg.createdAt > p.lastReadAt) &&
      lastMsg.sender.name !== session.user.name;

    return {
      id: conv.id,
      subject: conv.subject,
      otherParticipants,
      lastMessage: lastMsg
        ? {
            content: lastMsg.content,
            senderName: lastMsg.sender.name,
            createdAt: lastMsg.createdAt,
          }
        : null,
      unread: !!unread,
      updatedAt: conv.updatedAt,
    };
  });
}

export async function getMessages(conversationId: string) {
  const session = await auth();
  if (!session) return [];

  // Verify participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  });
  if (!participant) return [];

  return prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
}
