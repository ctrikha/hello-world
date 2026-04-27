"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { useBoardStore, type BoardApplication } from "@/store/boardStore";
import { KanbanColumn } from "./KanbanColumn";
import { AddApplicationModal } from "./AddApplicationModal";
import { reorderApplication } from "@/actions/applications";
import type { ApplicationStatus } from "@prisma/client";

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: "RESEARCHING", label: "Researching" },
  { id: "PLANNING", label: "Planning" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "SUBMITTED", label: "Submitted" },
  { id: "INTERVIEW", label: "Interview" },
  { id: "DECISION", label: "Decision" },
  { id: "ENROLLED", label: "Enrolled" },
];

type BoardColumns = Record<ApplicationStatus, BoardApplication[]>;

interface Props {
  initialColumns: BoardColumns;
}

export function KanbanBoard({ initialColumns }: Props) {
  const { columns, setColumns, moveCard } = useBoardStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns, setColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !columns) return;

    const cardId = active.id as string;
    const overColumn = (over.data.current?.column ?? over.id) as ApplicationStatus;

    // Find current column of the card
    let fromColumn: ApplicationStatus | null = null;
    for (const col of Object.keys(columns) as ApplicationStatus[]) {
      if (columns[col].some((c) => c.id === cardId)) {
        fromColumn = col;
        break;
      }
    }

    if (!fromColumn) return;

    // Compute new order: place at end of target column
    const targetCards = columns[overColumn];
    const maxOrder = targetCards.reduce((m, c) => Math.max(m, c.columnOrder), 0);
    const newOrder = maxOrder + 1000;

    // Optimistic update
    moveCard(cardId, overColumn, newOrder);

    // Persist
    reorderApplication({ id: cardId, newColumn: overColumn, newOrder }).catch(() => {
      // Revert on error by resetting to initial (simple recovery)
      setColumns(initialColumns);
    });

    setActiveId(null);
  }

  function handleDragOver(event: DragOverEvent) {
    setActiveId(event.active.id as string);
  }

  if (!columns) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div />
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + Add college
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              cards={columns[col.id]}
              isDraggingId={activeId}
            />
          ))}
        </div>
      </DndContext>

      {showAddModal && (
        <AddApplicationModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
