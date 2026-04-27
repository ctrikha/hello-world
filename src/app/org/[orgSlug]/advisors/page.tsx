"use client";

import { useState, useTransition } from "react";
import { inviteUser, removeUserFromOrg } from "@/actions/admin";
import { useParams } from "next/navigation";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface Props {
  members: Member[];
  orgId: string;
}

function AdvisorsClient({ members: initialMembers, orgId }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const advisors = members.filter((m) => m.role === "ADVISOR");

  async function handleInvite() {
    if (!email.trim()) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        await inviteUser({ email: email.trim(), role: "ADVISOR", orgId });
        setSuccess(`Invite sent to ${email}`);
        setEmail("");
      } catch {
        setError("Failed to invite. Make sure you are an admin.");
      }
    });
  }

  async function handleRemove(userId: string) {
    startTransition(async () => {
      await removeUserFromOrg({ userId, orgId });
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Advisors</h1>

      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Invite an advisor</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="advisor@example.com"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleInvite}
            disabled={isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Invite
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-600">
            Active advisors ({advisors.length})
          </h3>
        </div>
        {advisors.length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">
            No advisors yet.
          </p>
        ) : (
          <ul className="divide-y">
            {advisors.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {a.user.name ?? a.user.email}
                  </p>
                  <p className="text-xs text-gray-400">{a.user.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(a.user.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Server component wrapper
import { auth } from "@/lib/auth";
import { getOrgMembers } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdvisorsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) redirect("/dashboard");

  const members = await getOrgMembers(org.id);
  if (!members) redirect("/dashboard");

  return (
    <AdvisorsClient
      members={members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      }))}
      orgId={org.id}
    />
  );
}
