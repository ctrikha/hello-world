"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ApplicationCard } from "./ApplicationCard";
import type { BoardApplication } from "@/store/boardStore";
import type { ApplicationStatus } from "@prisma/client";

interface Props {
  id: ApplicationStatus;
  label: string;
  cards: BoardApplication[];
  isDraggingId: string | null;
}

export function KanbanColumn({ id, label, cards, isDraggingId }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { column: id },
  });

  return (
    <div className="flex-shrink-0 w-64">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          {cards.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-32 rounded-xl p-2 space-y-2 transition ${
          isOver ? "bg-indigo-50 ring-2 ring-indigo-300" : "bg-gray-100"
        }`}
      >
        <SortableContext
          id={id}
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <ApplicationCard
              key={card.id}
              card={card}
              isDragging={card.id === isDraggingId}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Drop here</p>
        )}
      </div>
    </div>
  );
}
