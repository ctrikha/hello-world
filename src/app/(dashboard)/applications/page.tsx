import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getApplicationBoard } from "@/actions/applications";
import { KanbanBoard } from "@/components/applications/KanbanBoard";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const columns = await getApplicationBoard();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">
          Track your college applications from research to enrollment
        </p>
      </div>

      {columns ? (
        <KanbanBoard initialColumns={columns} />
      ) : (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          Complete your student profile first to start tracking applications.
        </div>
      )}
    </div>
  );
}
