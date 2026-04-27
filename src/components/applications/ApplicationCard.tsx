"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { deleteApplication } from "@/actions/applications";
import { useBoardStore } from "@/store/boardStore";
import type { BoardApplication } from "@/store/boardStore";

const OUTCOME_COLORS: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700",
  WAITLISTED: "bg-yellow-100 text-yellow-700",
  DEFERRED: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

function DeadlineBadge({ deadline }: { deadline: Date }) {
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const color =
    daysLeft < 0
      ? "text-red-500"
      : daysLeft <= 7
      ? "text-orange-500"
      : daysLeft <= 30
      ? "text-yellow-600"
      : "text-gray-400";

  return (
    <span className={`text-xs ${color}`}>
      {daysLeft < 0
        ? "Overdue"
        : daysLeft === 0
        ? "Due today"
        : `${daysLeft}d left`}
    </span>
  );
}

interface Props {
  card: BoardApplication;
  isDragging: boolean;
}

export function ApplicationCard({ card, isDragging }: Props) {
  const { removeCard } = useBoardStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id, data: { column: card.boardColumn } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    removeCard(card.id);
    await deleteApplication(card.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-3 shadow-sm border cursor-grab active:cursor-grabbing transition ${
        isDragging || isSortableDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
          {card.college.name}
        </p>
        <button
          onClick={handleDelete}
          className="text-gray-300 hover:text-red-400 text-xs shrink-0 mt-0.5"
          title="Remove"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-0.5">
        {card.college.city}, {card.college.state}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {card.decisionType && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
            {card.decisionType}
          </span>
        )}
        {card.fitScore != null && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              card.fitScore >= 75
                ? "bg-green-50 text-green-600"
                : card.fitScore >= 50
                ? "bg-yellow-50 text-yellow-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {card.fitScore}%
          </span>
        )}
        {card.outcome && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              OUTCOME_COLORS[card.outcome] ?? "bg-gray-100 text-gray-500"
            }`}
          >
            {card.outcome.charAt(0) + card.outcome.slice(1).toLowerCase()}
          </span>
        )}
      </div>

      {card.deadline && (
        <div className="mt-1.5">
          <DeadlineBadge deadline={new Date(card.deadline)} />
        </div>
      )}
    </div>
  );
}
