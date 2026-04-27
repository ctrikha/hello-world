"use client";

import { useState, useTransition } from "react";
import { searchColleges } from "@/actions/colleges";
import { createApplication } from "@/actions/applications";
import { useBoardStore } from "@/store/boardStore";
import type { BoardApplication } from "@/store/boardStore";

interface Props {
  onClose: () => void;
}

type College = {
  id: string;
  name: string;
  city: string;
  state: string;
  acceptanceRate: unknown;
};

export function AddApplicationModal({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<College[]>([]);
  const [selected, setSelected] = useState<College | null>(null);
  const [decisionType, setDecisionType] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { addCard } = useBoardStore();

  function handleSearch(q: string) {
    setQuery(q);
    startTransition(async () => {
      const res = await searchColleges({ query: q, page: 1, limit: 8 });
      setResults(res.colleges);
    });
  }

  async function handleSubmit() {
    if (!selected) return;
    setError("");

    const result = await createApplication({
      collegeId: selected.id,
      decisionType: decisionType as "EA" | "ED" | "ED2" | "RD" | "ROLLING" | undefined,
      deadline: deadline || undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.application) {
      const app = result.application as typeof result.application & { college: import("@prisma/client").College };
      const card: BoardApplication = {
        id: app.id,
        collegeId: app.collegeId,
        boardColumn: app.boardColumn,
        columnOrder: app.columnOrder,
        status: app.status,
        fitScore: app.fitScore,
        deadline: app.deadline,
        decisionType: app.decisionType,
        outcome: app.outcome,
        college: app.college,
      };
      addCard(card);
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add a college</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {!selected ? (
          <div>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search colleges..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            />
            {results.length > 0 && (
              <ul className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelected(c)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {c.city}, {c.state}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-4 py-3">
              <div>
                <p className="font-medium text-sm">{selected.name}</p>
                <p className="text-xs text-gray-500">
                  {selected.city}, {selected.state}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-indigo-400 text-xs hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application type
              </label>
              <select
                value={decisionType}
                onChange={(e) => setDecisionType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select type</option>
                <option value="EA">Early Action (EA)</option>
                <option value="ED">Early Decision (ED)</option>
                <option value="ED2">Early Decision II (ED2)</option>
                <option value="RD">Regular Decision (RD)</option>
                <option value="ROLLING">Rolling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline (optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
