"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, eachHourOfInterval, format } from "date-fns";

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export async function getAdvisorAvailability(
  advisorId: string,
  weekStart: Date
): Promise<TimeSlot[]> {
  const advisor = await prisma.advisorProfile.findUnique({
    where: { userId: advisorId },
    select: { availability: true },
  });

  type AvailabilityWindow = { dayOfWeek: number; startHour: number; endHour: number };
  const windows: AvailabilityWindow[] =
    (advisor?.availability as AvailabilityWindow[] | null) ?? [
      { dayOfWeek: 1, startHour: 9, endHour: 17 },
      { dayOfWeek: 2, startHour: 9, endHour: 17 },
      { dayOfWeek: 3, startHour: 9, endHour: 17 },
      { dayOfWeek: 4, startHour: 9, endHour: 17 },
      { dayOfWeek: 5, startHour: 9, endHour: 17 },
    ];

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Get existing meetings for this advisor this week
  const existingMeetings = await prisma.meeting.findMany({
    where: {
      advisorId,
      startTime: { gte: weekStart },
      endTime: { lte: weekEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startTime: true, endTime: true },
  });

  const slots: TimeSlot[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + dayOffset);
    const dayOfWeek = day.getDay() === 0 ? 7 : day.getDay(); // Mon=1, Sun=7

    const window = windows.find((w) => w.dayOfWeek === dayOfWeek);
    if (!window) continue;

    for (let hour = window.startHour; hour < window.endHour; hour++) {
      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      const isBooked = existingMeetings.some(
        (m) => m.startTime < slotEnd && m.endTime > slotStart
      );

      const isPast = slotStart < new Date();

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !isBooked && !isPast,
      });
    }
  }

  return slots;
}

export async function bookMeeting(params: {
  advisorId: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
}) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const startTime = new Date(params.startTime);
  const endTime = new Date(params.endTime);

  // Check slot is still available
  const conflict = await prisma.meeting.findFirst({
    where: {
      advisorId: params.advisorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  if (conflict) return { error: "This time slot is no longer available" };

  const meeting = await prisma.meeting.create({
    data: {
      studentId: session.user.id,
      advisorId: params.advisorId,
      title: params.title,
      description: params.description,
      startTime,
      endTime,
      status: "CONFIRMED",
    },
    include: {
      advisor: { select: { name: true, email: true } },
      student: { select: { name: true, email: true } },
    },
  });

  return { success: true, meeting };
}

export async function cancelMeeting(meetingId: string, reason?: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      OR: [{ studentId: session.user.id }, { advisorId: session.user.id }],
    },
  });
  if (!meeting) return { error: "Meeting not found" };

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: "CANCELLED", cancelReason: reason },
  });

  return { success: true };
}

export async function getMeetings() {
  const session = await auth();
  if (!session) return [];

  return prisma.meeting.findMany({
    where: {
      OR: [{ studentId: session.user.id }, { advisorId: session.user.id }],
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      advisor: { select: { id: true, name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
  });
}
