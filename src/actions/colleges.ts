"use server";

import { prisma } from "@/lib/prisma";
import {
  collegeSearchSchema,
  type CollegeSearchInput,
} from "@/lib/validations/college";
import type { Prisma } from "@prisma/client";

export async function searchColleges(input: CollegeSearchInput) {
  const parsed = collegeSearchSchema.safeParse(input);
  if (!parsed.success) return { colleges: [], total: 0 };

  const {
    query,
    state,
    size,
    setting,
    control,
    maxTuition,
    minAcceptanceRate,
    maxAcceptanceRate,
    page,
    limit,
  } = parsed.data;

  const where: Prisma.CollegeWhereInput = {};

  if (query && query.trim()) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { state: { contains: query, mode: "insensitive" } },
    ];
  }

  if (state && state.length > 0) where.state = { in: state };
  if (size) where.size = size;
  if (setting) where.setting = setting;
  if (control) where.control = control;

  if (maxTuition) {
    where.OR = [
      ...(where.OR ?? []),
      { avgNetPrice: { lte: maxTuition } },
      { avgNetPrice: null },
    ];
  }

  if (minAcceptanceRate !== undefined) {
    where.acceptanceRate = {
      ...(where.acceptanceRate as object),
      gte: minAcceptanceRate,
    };
  }
  if (maxAcceptanceRate !== undefined) {
    where.acceptanceRate = {
      ...(where.acceptanceRate as object),
      lte: maxAcceptanceRate,
    };
  }

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        state: true,
        acceptanceRate: true,
        tuitionInState: true,
        tuitionOutState: true,
        avgNetPrice: true,
        size: true,
        setting: true,
        control: true,
        satMid50Low: true,
        satMid50High: true,
        actMid50Low: true,
        actMid50High: true,
        popularMajors: true,
        regularDeadline: true,
        earlyActionDate: true,
        earlyDecisionDate: true,
        logoUrl: true,
      },
    }),
    prisma.college.count({ where }),
  ]);

  return { colleges, total, page, limit };
}

export async function getCollege(slugOrId: string) {
  return prisma.college.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
  });
}

export async function getCollegesByIds(ids: string[]) {
  return prisma.college.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      acceptanceRate: true,
      avgNetPrice: true,
      size: true,
      setting: true,
      satMid50Low: true,
      satMid50High: true,
      actMid50Low: true,
      actMid50High: true,
      popularMajors: true,
    },
  });
}
