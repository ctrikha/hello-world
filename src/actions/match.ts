"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeFitScore, type StudentSnapshot } from "@/lib/fit-score";
import { generateFitNarrative } from "@/lib/claude";

export async function runFitScoring(studentUserId?: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const userId = studentUserId ?? session.user.id;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!profile) return { error: "Student profile not found" };

  const student: StudentSnapshot = {
    satScore: profile.satScore,
    actScore: profile.actScore,
    gpa: profile.gpa ? Number(profile.gpa) : null,
    intendedMajors: profile.intendedMajors,
    preferredSize: profile.preferredSize,
    preferredRegion: profile.preferredRegion,
    maxTuition: profile.maxTuition,
    prefersCampus: profile.prefersCampus,
  };

  const colleges = await prisma.college.findMany({
    select: {
      id: true,
      name: true,
      satMid50Low: true,
      satMid50High: true,
      actMid50Low: true,
      actMid50High: true,
      acceptanceRate: true,
      avgNetPrice: true,
      size: true,
      setting: true,
      state: true,
      popularMajors: true,
    },
  });

  const scored = colleges
    .map((college) => {
      const result = computeFitScore(student, {
        ...college,
        acceptanceRate: college.acceptanceRate ? Number(college.acceptanceRate) : null,
        avgNetPrice: college.avgNetPrice,
      });
      return { college, ...result };
    })
    .sort((a, b) => b.total - a.total);

  // Update fit scores on existing applications
  const applications = await prisma.application.findMany({
    where: { studentProfileId: profile.id },
    select: { id: true, collegeId: true },
  });

  await Promise.all(
    applications.map(async (app) => {
      const scored_college = scored.find((s) => s.college.id === app.collegeId);
      if (!scored_college) return;
      await prisma.application.update({
        where: { id: app.id },
        data: {
          fitScore: scored_college.total,
          fitDetails: { breakdown: scored_college.breakdown },
        },
      });
    })
  );

  return { scored: scored.slice(0, 20), total: scored.length };
}

export async function getTopMatches(limit = 10) {
  const session = await auth();
  if (!session) return null;

  const result = await runFitScoring();
  if (!result || "error" in result) return null;

  const topCollegeIds = result.scored.slice(0, limit).map((s) => s.college.id);
  const colleges = await prisma.college.findMany({
    where: { id: { in: topCollegeIds } },
  });

  return result.scored.slice(0, limit).map((s) => ({
    college: colleges.find((c) => c.id === s.college.id)!,
    fitScore: s.total,
    breakdown: s.breakdown,
  }));
}

export async function getAIFitNarrative(applicationId: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      college: true,
      studentProfile: true,
    },
  });
  if (!application) return { error: "Application not found" };

  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "AI narrative not available (missing API key)" };
  }

  const narrative = await generateFitNarrative({
    student: {
      gpa: application.studentProfile.gpa ? Number(application.studentProfile.gpa) : null,
      satScore: application.studentProfile.satScore,
      actScore: application.studentProfile.actScore,
      intendedMajors: application.studentProfile.intendedMajors,
      preferredSize: application.studentProfile.preferredSize,
      state: application.studentProfile.state,
      extracurriculars: application.studentProfile.extracurriculars,
    },
    college: {
      name: application.college.name,
      city: application.college.city,
      state: application.college.state,
      acceptanceRate: application.college.acceptanceRate
        ? Number(application.college.acceptanceRate)
        : null,
      satMid50Low: application.college.satMid50Low,
      satMid50High: application.college.satMid50High,
      avgNetPrice: application.college.avgNetPrice,
      popularMajors: application.college.popularMajors,
      size: application.college.size,
      setting: application.college.setting,
    },
    fitScore: application.fitScore ?? 0,
  });

  // Cache in application record
  const currentDetails = (application.fitDetails as Record<string, unknown>) ?? {};
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      fitDetails: { ...currentDetails, aiNarrative: narrative },
    },
  });

  return { narrative };
}
