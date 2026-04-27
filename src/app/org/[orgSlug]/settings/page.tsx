import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgSettingsPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { settings: true },
  });
  if (!org) redirect("/dashboard");

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Organization name</p>
          <p className="text-gray-900 mt-0.5">{org.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Slug</p>
          <p className="text-gray-500 text-sm mt-0.5">{org.slug}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Plan</p>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mt-0.5 inline-block">
            {org.plan}
          </span>
        </div>
        {org.customDomain && (
          <div>
            <p className="text-sm font-medium text-gray-700">Custom domain</p>
            <p className="text-gray-500 text-sm mt-0.5">{org.customDomain}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-700">Self-registration</p>
          <p className="text-gray-500 text-sm mt-0.5">
            {org.settings?.allowSelfRegister ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
    </div>
  );
}
