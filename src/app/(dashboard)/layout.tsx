import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const orgId = session.user.orgId;
  let orgName = "My Workspace";

  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });
    if (org) orgName = org.name;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role={session.user.role} orgName={orgName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          userName={session.user.name}
          userEmail={session.user.email}
          role={session.user.role}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
