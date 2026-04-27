"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

async function assertAdmin(orgId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: { userId: session.user.id, organizationId: orgId },
    },
  });
  if (membership?.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function inviteUser(params: {
  email: string;
  role: Role;
  orgId: string;
}) {
  await assertAdmin(params.orgId);

  // Expire previous pending invites for this email in this org
  await prisma.invite.updateMany({
    where: {
      email: params.email,
      organizationId: params.orgId,
      acceptedAt: null,
    },
    data: { expiresAt: new Date() },
  });

  const invite = await prisma.invite.create({
    data: {
      email: params.email,
      organizationId: params.orgId,
      role: params.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    include: { organization: { select: { name: true } } },
  });

  return { invite };
}

export async function removeUserFromOrg(params: {
  userId: string;
  orgId: string;
}) {
  await assertAdmin(params.orgId);

  await prisma.userOrganization.delete({
    where: {
      userId_organizationId: {
        userId: params.userId,
        organizationId: params.orgId,
      },
    },
  });

  return { success: true };
}

export async function assignAdvisorToStudent(params: {
  studentUserId: string;
  advisorUserId: string;
}) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };
  if (session.user.role !== "ADMIN" && session.user.role !== "ADVISOR") {
    return { error: "Forbidden" };
  }

  await prisma.studentProfile.update({
    where: { userId: params.studentUserId },
    data: { advisorId: params.advisorUserId },
  });

  return { success: true };
}

export async function updateOrgSettings(params: {
  orgId: string;
  brandColor?: string;
  allowSelfRegister?: boolean;
  requireParentLink?: boolean;
}) {
  await assertAdmin(params.orgId);

  const { orgId, ...data } = params;
  await prisma.orgSettings.upsert({
    where: { organizationId: orgId },
    create: { organizationId: orgId, ...data },
    update: data,
  });

  return { success: true };
}

export async function getOrgMembers(orgId: string) {
  const session = await auth();
  if (!session) return null;

  return prisma.userOrganization.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { joinedAt: "desc" },
  });
}
