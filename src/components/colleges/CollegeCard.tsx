import Link from "next/link";
import type { CollegeSize, CampusSetting, CollegeControl } from "@prisma/client";

interface CollegeCardData {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  acceptanceRate: number | null;
  avgNetPrice: number | null;
  tuitionOutState: number | null;
  size: CollegeSize | null;
  setting: CampusSetting | null;
  control: CollegeControl | null;
  popularMajors: string[];
  fitScore?: number | null;
}

interface Props {
  college: CollegeCardData;
}

function formatRate(rate: number | null) {
  if (rate === null) return "—";
  return `${(rate * 100).toFixed(0)}%`;
}

function formatMoney(n: number | null) {
  if (n === null) return "—";
  return `$${n.toLocaleString()}`;
}

export function CollegeCard({ college }: Props) {
  return (
    <Link
      href={`/dashboard/colleges/${college.slug}`}
      className="block bg-white border rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{college.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {college.city}, {college.state} ·{" "}
            {college.control === "PUBLIC" ? "Public" : "Private"}{" "}
            {college.size?.toLowerCase() ?? ""}
          </p>
        </div>
        {college.fitScore != null && (
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
              college.fitScore >= 75
                ? "bg-green-100 text-green-700"
                : college.fitScore >= 50
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {college.fitScore}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>Acceptance: {formatRate(college.acceptanceRate as unknown as number)}</span>
        <span>
          Avg net price:{" "}
          {formatMoney((college.avgNetPrice ?? college.tuitionOutState) as number | null)}
        </span>
        {college.setting && (
          <span className="capitalize">{college.setting.toLowerCase()}</span>
        )}
      </div>

      {college.popularMajors.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {college.popularMajors.slice(0, 3).map((m) => (
            <span
              key={m}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
            >
              {m}
            </span>
          ))}
          {college.popularMajors.length > 3 && (
            <span className="text-xs text-gray-400">
              +{college.popularMajors.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
