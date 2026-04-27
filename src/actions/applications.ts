"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createApplicationSchema,
  updateApplicationSchema,
  type CreateApplicationInput,
  type UpdateApplicationInput,
} from "@/lib/validations/application";
import type { ApplicationStatus } from "@prisma/client";
import { computeFitScore } from "@/lib/fit-score";

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } });
}

export async function createApplication(input: CreateApplicationInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const parsed = createApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile) return { error: "Student profile not found" };

  const { collegeId, decisionType, deadline } = parsed.data;

  // Get max columnOrder in RESEARCHING column
  const maxOrder = await prisma.application.aggregate({
    where: { studentProfileId: profile.id, boardColumn: "RESEARCHING" },
    _max: { columnOrder: true },
  });
  const newOrder = (maxOrder._max.columnOrder ?? 0) + 1000;

  // Compute fit score
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: {
      id: true, name: true, satMid50Low: true, satMid50High: true,
      actMid50Low: true, actMid50High: true, acceptanceRate: true,
      avgNetPrice: true, size: true, setting: true, state: true, popularMajors: true,
    },
  });

  let fitScore: number | undefined;
  let fitDetails: object | undefined;

  if (college) {
    const result = computeFitScore(
      {
        satScore: profile.satScore,
        actScore: profile.actScore,
        gpa: profile.gpa ? Number(profile.gpa) : null,
        intendedMajors: profile.intendedMajors,
        preferredSize: profile.preferredSize,
        preferredRegion: profile.preferredRegion,
        maxTuition: profile.maxTuition,
        prefersCampus: profile.prefersCampus,
      },
      {
        ...college,
        acceptanceRate: college.acceptanceRate ? Number(college.acceptanceRate) : null,
      }
    );
    fitScore = result.total;
    fitDetails = { breakdown: result.breakdown };
  }

  const application = await prisma.application.create({
    data: {
      studentProfileId: profile.id,
      collegeId,
      decisionType: decisionType ?? null,
      deadline: deadline ? new Date(deadline) : null,
      boardColumn: "RESEARCHING",
      columnOrder: newOrder,
      fitScore: fitScore ?? null,
      fitDetails: fitDetails ? (fitDetails as object) : undefined,
    },
    include: { college: true },
  });

  return { success: true, application };
}

export async function updateApplication(input: UpdateApplicationInput) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const parsed = updateApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { id, notes, deadline, submittedAt, ...data } = parsed.data;

  // Verify ownership
  const profile = await getStudentProfile(session.user.id);
  const app = await prisma.application.findFirst({
    where: { id, studentProfileId: profile?.id },
  });
  if (!app) return { error: "Application not found" };

  const updated = await prisma.application.update({
    where: { id },
    data: {
      ...data,
      deadline: deadline ? new Date(deadline) : deadline === null ? null : undefined,
      submittedAt: submittedAt
        ? new Date(submittedAt)
        : submittedAt === null
        ? null
        : undefined,
    },
    include: { college: true },
  });

  if (notes) {
    await prisma.applicationNote.create({
      data: { applicationId: id, authorId: session.user.id, content: notes },
    });
  }

  return { success: true, application: updated };
}

export async function reorderApplication(params: {
  id: string;
  newColumn: ApplicationStatus;
  newOrder: number;
}) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const profile = await getStudentProfile(session.user.id);
  const app = await prisma.application.findFirst({
    where: { id: params.id, studentProfileId: profile?.id },
  });
  if (!app) return { error: "Application not found" };

  await prisma.application.update({
    where: { id: params.id },
    data: {
      boardColumn: params.newColumn,
      status: params.newColumn,
      columnOrder: params.newOrder,
    },
  });

  return { success: true };
}

export async function deleteApplication(id: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const profile = await getStudentProfile(session.user.id);
  const app = await prisma.application.findFirst({
    where: { id, studentProfileId: profile?.id },
  });
  if (!app) return { error: "Application not found" };

  await prisma.application.delete({ where: { id } });
  return { success: true };
}

export async function getApplicationBoard(userId?: string) {
  const session = await auth();
  if (!session) return null;

  const targetUserId = userId ?? session.user.id;
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: targetUserId },
  });
  if (!profile) return null;

  const applications = await prisma.application.findMany({
    where: { studentProfileId: profile.id },
    include: { college: true, notes: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { columnOrder: "asc" },
  });

  // Group by board column
  const columns: Record<ApplicationStatus, typeof applications> = {
    RESEARCHING: [],
    PLANNING: [],
    IN_PROGRESS: [],
    SUBMITTED: [],
    INTERVIEW: [],
    DECISION: [],
    ENROLLED: [],
  };

  for (const app of applications) {
    columns[app.boardColumn].push(app);
  }

  return columns;
}
