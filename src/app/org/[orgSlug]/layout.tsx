import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) redirect("/dashboard");

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: org.id,
      },
    },
  });
  if (membership?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-900">{org.name}</span>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </header>

      <div className="flex">
        <aside className="w-56 bg-white border-r min-h-[calc(100vh-3rem)] p-4">
          <nav className="space-y-1">
            {[
              { href: `/org/${orgSlug}`, label: "Overview" },
              { href: `/org/${orgSlug}/advisors`, label: "Advisors" },
              { href: `/org/${orgSlug}/students`, label: "Students" },
              { href: `/org/${orgSlug}/settings`, label: "Settings" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
