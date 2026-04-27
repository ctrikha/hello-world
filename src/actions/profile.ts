"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  studentProfileSchema,
  advisorProfileSchema,
  type StudentProfileInput,
  type AdvisorProfileInput,
} from "@/lib/validations/profile";

export async function upsertStudentProfile(input: StudentProfileInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const parsed = studentProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const profile = await prisma.studentProfile.upsert({
    where: { userId: session.user.id },
    create: { ...data, userId: session.user.id },
    update: data,
  });

  return { success: true, profile };
}

export async function upsertAdvisorProfile(input: AdvisorProfileInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const parsed = advisorProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const profile = await prisma.advisorProfile.upsert({
    where: { userId: session.user.id },
    create: { ...data, userId: session.user.id },
    update: data,
  });

  return { success: true, profile };
}

export async function getStudentRoster(orgId: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const students = await prisma.studentProfile.findMany({
    where: {
      user: {
        organizations: { some: { organizationId: orgId } },
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { students };
}

export async function getStudentProfile(userId?: string) {
  const session = await auth();
  if (!session) return null;

  return prisma.studentProfile.findUnique({
    where: { userId: userId ?? session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function getAdvisorProfile(userId?: string) {
  const session = await auth();
  if (!session) return null;

  return prisma.advisorProfile.findUnique({
    where: { userId: userId ?? session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });
}
