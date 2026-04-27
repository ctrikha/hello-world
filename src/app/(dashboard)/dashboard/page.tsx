import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const role = session.user.role;
  const userId = session.user.id;

  let stats: { label: string; value: string; href: string }[] = [];

  if (role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { _count: { select: { applications: true } } },
    });
    stats = [
      {
        label: "Applications",
        value: String(profile?._count.applications ?? 0),
        href: "/dashboard/applications",
      },
      {
        label: "Profile complete",
        value: profile?.gpa ? "Yes" : "No",
        href: "/dashboard/profile",
      },
    ];
  } else if (role === "ADVISOR") {
    const profile = await prisma.advisorProfile.findUnique({
      where: { userId },
    });
    const studentCount = await prisma.studentProfile.count({
      where: { advisorId: userId },
    });
    stats = [
      {
        label: "Students",
        value: String(studentCount),
        href: "/dashboard/students",
      },
      {
        label: "Accepting clients",
        value: profile?.acceptingClients ? "Yes" : "No",
        href: "/dashboard/profile",
      },
    ];
  }

  const upcomingMeetings = await prisma.meeting.findMany({
    where: {
      OR: [{ studentId: userId }, { advisorId: userId }],
      startTime: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    orderBy: { startTime: "asc" },
    take: 3,
    include: {
      student: { select: { name: true } },
      advisor: { select: { name: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border rounded-xl p-4 hover:border-indigo-300 transition"
          >
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {upcomingMeetings.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3">
            Upcoming meetings
          </h2>
          <ul className="space-y-2">
            {upcomingMeetings.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-medium">{m.title}</span>
                  <span className="text-gray-400 ml-2">
                    with{" "}
                    {role === "STUDENT" ? m.advisor.name : m.student.name}
                  </span>
                </div>
                <span className="text-gray-500">
                  {m.startTime.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/colleges", label: "Search colleges", icon: "🎓" },
          {
            href: role === "STUDENT"
              ? "/dashboard/applications"
              : "/dashboard/students",
            label: role === "STUDENT" ? "Track applications" : "View students",
            icon: role === "STUDENT" ? "📋" : "👥",
          },
          { href: "/dashboard/messages", label: "Messages", icon: "💬" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white border rounded-xl p-5 flex items-center gap-3 hover:border-indigo-300 transition"
          >
            <span className="text-2xl">{card.icon}</span>
            <span className="font-medium text-gray-800">{card.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
