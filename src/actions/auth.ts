"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, role, inviteToken } = parsed.data;

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });

  if (inviteToken) {
    return acceptInvite({ email, name, token: inviteToken });
  }

  let user = existing;
  if (!user) {
    user = await prisma.user.create({ data: { name, email } });
  }

  // Create a personal org for self-serve users (no invite)
  const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
  const orgSlug = `${slug}-${Date.now()}`;

  let org = await prisma.organization.findFirst({
    where: { users: { some: { userId: user.id } } },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: name ?? email,
        slug: orgSlug,
        plan: "FREE",
        users: { create: { userId: user.id, role: role as Role } },
      },
    });

    // Create profile based on role
    if (role === "STUDENT") {
      await prisma.studentProfile.create({ data: { userId: user.id } });
    } else if (role === "ADVISOR") {
      await prisma.advisorProfile.create({ data: { userId: user.id } });
    }
  }

  await signIn("resend", { email, redirect: false });
  return { success: true };
}

export async function acceptInvite({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "Invalid or expired invite link" };
  }
  if (invite.email !== email) {
    return { error: "This invite was sent to a different email address" };
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { name, email } });
  }

  await prisma.$transaction([
    prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invite.organizationId,
        },
      },
      create: {
        userId: user.id,
        organizationId: invite.organizationId,
        role: invite.role,
      },
      update: { role: invite.role },
    }),
    prisma.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  if (invite.role === "STUDENT") {
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
  } else if (invite.role === "ADVISOR") {
    await prisma.advisorProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
  }

  await signIn("resend", { email, redirect: false });
  return { success: true };
}
