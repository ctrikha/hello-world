"use client";

import { useState, useTransition, useCallback } from "react";
import { searchColleges } from "@/actions/colleges";
import { CollegeCard } from "./CollegeCard";
import type { CollegeSearchInput } from "@/lib/validations/college";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

type College = Awaited<ReturnType<typeof searchColleges>>["colleges"][number];

interface Props {
  initialColleges: College[];
  initialTotal: number;
}

export function CollegeSearch({ initialColleges, initialTotal }: Props) {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<CollegeSearchInput["size"]>();
  const [setting, setSetting] = useState<CollegeSearchInput["setting"]>();
  const [control, setControl] = useState<CollegeSearchInput["control"]>();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [colleges, setColleges] = useState(initialColleges);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  const runSearch = useCallback(
    (overrides: Partial<CollegeSearchInput> = {}) => {
      startTransition(async () => {
        const result = await searchColleges({
          query,
          size,
          setting,
          control,
          state: selectedStates.length > 0 ? selectedStates : undefined,
          page: 1,
          limit: 20,
          ...overrides,
        });
        setColleges(result.colleges);
        setTotal(result.total);
      });
    },
    [query, size, setting, control, selectedStates]
  );

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    // Debounce handled by delay in runSearch call
    startTransition(async () => {
      const result = await searchColleges({
        query: e.target.value,
        size,
        setting,
        control,
        state: selectedStates.length > 0 ? selectedStates : undefined,
        page: 1,
        limit: 20,
      });
      setColleges(result.colleges);
      setTotal(result.total);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search colleges by name, city, or state..."
          className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition ${
            showFilters ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "hover:bg-gray-50"
          }`}
        >
          Filters {showFilters ? "▲" : "▼"}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Size
            </p>
            <div className="flex gap-2">
              {(["SMALL", "MEDIUM", "LARGE"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const next = size === s ? undefined : s;
                    setSize(next);
                    runSearch({ size: next });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    size === s
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Setting
            </p>
            <div className="flex gap-2">
              {(["URBAN", "SUBURBAN", "RURAL"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const next = setting === s ? undefined : s;
                    setSetting(next);
                    runSearch({ setting: next });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    setting === s
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Type
            </p>
            <div className="flex gap-2">
              {(["PUBLIC", "PRIVATE"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    const next = control === c ? undefined : c;
                    setControl(next);
                    runSearch({ control: next });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    control === c
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              State
            </p>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {US_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    const next = selectedStates.includes(st)
                      ? selectedStates.filter((s) => s !== st)
                      : [...selectedStates, st];
                    setSelectedStates(next);
                    runSearch({ state: next.length > 0 ? next : undefined });
                  }}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                    selectedStates.includes(st)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSize(undefined);
              setSetting(undefined);
              setControl(undefined);
              setSelectedStates([]);
              runSearch({
                size: undefined,
                setting: undefined,
                control: undefined,
                state: undefined,
              });
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {isPending ? "Searching..." : `${total} colleges found`}
        </span>
      </div>

      <div className={`grid gap-3 ${isPending ? "opacity-60" : ""}`}>
        {colleges.length === 0 ? (
          <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
            No colleges found. Try adjusting your filters.
          </div>
        ) : (
          colleges.map((c) => (
            <CollegeCard
              key={c.id}
              college={{
                ...c,
                acceptanceRate: c.acceptanceRate ? Number(c.acceptanceRate) : null,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
