import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { ApplicationReminderEmail } from "@/../emails/ApplicationReminder";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const applications = await prisma.application.findMany({
    where: {
      deadline: {
        gte: now,
        lte: in7Days,
      },
      status: {
        notIn: ["SUBMITTED", "DECISION", "ENROLLED"],
      },
    },
    include: {
      college: { select: { name: true } },
      studentProfile: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  let sent = 0;
  for (const app of applications) {
    if (!app.deadline) continue;

    const daysLeft = Math.ceil(
      (app.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft !== 7 && daysLeft !== 3) continue;

    const { name, email } = app.studentProfile.user;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const html = ApplicationReminderEmail({
      studentName: name ?? "Student",
      collegeName: app.college.name,
      deadline: app.deadline.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      daysLeft,
      appUrl,
    });

    await sendEmail({
      to: email,
      subject: `Reminder: ${app.college.name} application due in ${daysLeft} days`,
      html,
    });
    sent++;
  }

  return NextResponse.json({ sent, total: applications.length });
}
