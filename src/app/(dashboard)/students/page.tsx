import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentRoster } from "@/actions/profile";
import Link from "next/link";

export default async function StudentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role !== "ADVISOR" && role !== "ADMIN") redirect("/dashboard");

  const orgId = session.user.orgId;
  if (!orgId) redirect("/dashboard");

  const result = await getStudentRoster(orgId);
  const students = result.students ?? [];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Students</h1>

      {students.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          No students yet. Invite students via the org admin panel.
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Graduation
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Applications
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.user.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.user.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.graduationYear}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {s._count.applications}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/students/${s.user.id}`}
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
