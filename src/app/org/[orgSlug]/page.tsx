import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgDashboardPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) redirect("/dashboard");

  const [memberCount, advisorCount, studentCount, meetingCount] =
    await Promise.all([
      prisma.userOrganization.count({ where: { organizationId: org.id } }),
      prisma.userOrganization.count({
        where: { organizationId: org.id, role: "ADVISOR" },
      }),
      prisma.userOrganization.count({
        where: { organizationId: org.id, role: "STUDENT" },
      }),
      prisma.meeting.count({
        where: {
          startTime: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
          student: { organizations: { some: { organizationId: org.id } } },
        },
      }),
    ]);

  const stats = [
    { label: "Total members", value: memberCount },
    { label: "Advisors", value: advisorCount },
    { label: "Students", value: studentCount },
    { label: "Meetings (7d)", value: meetingCount },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{org.name}</h1>
      <p className="text-sm text-gray-400 mb-6">
        {org.plan} plan · {org.slug}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
