import { notFound } from "next/navigation";
import { getCollege } from "@/actions/colleges";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatRate(rate: unknown) {
  if (rate === null || rate === undefined) return "—";
  return `${(Number(rate) * 100).toFixed(0)}%`;
}

function formatMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${n.toLocaleString()}`;
}

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CollegeDetailPage({ params }: Props) {
  const { slug } = await params;
  const college = await getCollege(slug);
  if (!college) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link
          href="/dashboard/colleges"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to search
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
        <p className="text-gray-500 mt-1">
          {college.city}, {college.state} ·{" "}
          {college.control === "PUBLIC" ? "Public" : "Private"} ·{" "}
          {college.size?.toLowerCase()} ·{" "}
          {college.setting?.toLowerCase()}
        </p>
        {college.website && (
          <a
            href={college.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline mt-1 inline-block"
          >
            {college.website} ↗
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Acceptance rate", value: formatRate(college.acceptanceRate) },
          { label: "Avg net price", value: formatMoney(college.avgNetPrice) },
          {
            label: "Out-of-state tuition",
            value: formatMoney(college.tuitionOutState),
          },
          {
            label: "Graduation rate",
            value: formatRate(college.graduationRate),
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Test Scores (Mid-50%)</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">SAT</dt>
              <dd className="font-medium">
                {college.satMid50Low && college.satMid50High
                  ? `${college.satMid50Low}–${college.satMid50High}`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">ACT</dt>
              <dd className="font-medium">
                {college.actMid50Low && college.actMid50High
                  ? `${college.actMid50Low}–${college.actMid50High}`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Deadlines</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Regular Decision</dt>
              <dd className="font-medium">{formatDate(college.regularDeadline)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Early Action</dt>
              <dd className="font-medium">{formatDate(college.earlyActionDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Early Decision</dt>
              <dd className="font-medium">{formatDate(college.earlyDecisionDate)}</dd>
            </div>
          </dl>
        </div>

        {college.popularMajors.length > 0 && (
          <div className="bg-white border rounded-xl p-5 sm:col-span-2">
            <h2 className="font-semibold text-gray-800 mb-3">Popular Majors</h2>
            <div className="flex flex-wrap gap-2">
              {college.popularMajors.map((m) => (
                <span
                  key={m}
                  className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
