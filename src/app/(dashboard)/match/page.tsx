import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTopMatches } from "@/actions/match";
import Link from "next/link";

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-gray-400">{value}</span>
    </div>
  );
}

export default async function MatchPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const matches = await getTopMatches(15);

  if (!matches || matches.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Matches</h1>
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">
            Complete your profile to see college matches.
          </p>
          <Link
            href="/dashboard/profile"
            className="text-indigo-600 font-medium hover:underline"
          >
            Complete profile →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Matches</h1>
        <p className="text-gray-500 mt-1">
          Colleges ranked by fit with your profile
        </p>
      </div>

      <div className="space-y-4">
        {matches.map(({ college, fitScore, breakdown }) => (
          <div key={college.id} className="bg-white border rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/dashboard/colleges/${college.slug}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600"
                >
                  {college.name}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">
                  {college.city}, {college.state}
                </p>
              </div>
              <div
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 ${
                  fitScore >= 75
                    ? "bg-green-100 text-green-700"
                    : fitScore >= 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <span className="text-lg font-bold leading-none">{fitScore}</span>
                <span className="text-xs opacity-70">/ 100</span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <ScoreBar label="Academic" value={breakdown.academic} max={30} />
              <ScoreBar label="Selectivity" value={breakdown.selectivity} max={15} />
              <ScoreBar label="Financial" value={breakdown.financial} max={20} />
              <ScoreBar label="Size" value={breakdown.size} max={10} />
              <ScoreBar label="Location" value={breakdown.location} max={10} />
              <ScoreBar label="Setting" value={breakdown.setting} max={5} />
              <ScoreBar label="Majors" value={breakdown.majors} max={10} />
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/dashboard/colleges/${college.slug}`}
                className="text-xs text-indigo-600 hover:underline"
              >
                View college →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
