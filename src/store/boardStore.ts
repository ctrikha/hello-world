import { create } from "zustand";
import type { ApplicationStatus, College } from "@prisma/client";

export interface BoardApplication {
  id: string;
  collegeId: string;
  boardColumn: ApplicationStatus;
  columnOrder: number;
  status: ApplicationStatus;
  fitScore: number | null;
  deadline: Date | null;
  decisionType: string | null;
  outcome: string | null;
  college: College;
}

type BoardColumns = Record<ApplicationStatus, BoardApplication[]>;

interface BoardStore {
  columns: BoardColumns | null;
  setColumns: (columns: BoardColumns) => void;
  moveCard: (cardId: string, toColumn: ApplicationStatus, newOrder: number) => void;
  removeCard: (cardId: string) => void;
  addCard: (card: BoardApplication) => void;
}

const EMPTY_COLUMNS = (): BoardColumns => ({
  RESEARCHING: [],
  PLANNING: [],
  IN_PROGRESS: [],
  SUBMITTED: [],
  INTERVIEW: [],
  DECISION: [],
  ENROLLED: [],
});

export const useBoardStore = create<BoardStore>((set) => ({
  columns: null,
  setColumns: (columns) => set({ columns }),
  moveCard: (cardId, toColumn, newOrder) =>
    set((state) => {
      if (!state.columns) return state;
      const columns = { ...state.columns };

      // Find and remove from current column
      let movedCard: BoardApplication | undefined;
      for (const col of Object.keys(columns) as ApplicationStatus[]) {
        const idx = columns[col].findIndex((c) => c.id === cardId);
        if (idx !== -1) {
          movedCard = { ...columns[col][idx], boardColumn: toColumn, columnOrder: newOrder };
          columns[col] = columns[col].filter((c) => c.id !== cardId);
          break;
        }
      }

      if (movedCard) {
        columns[toColumn] = [...columns[toColumn], movedCard].sort(
          (a, b) => a.columnOrder - b.columnOrder
        );
      }

      return { columns };
    }),
  removeCard: (cardId) =>
    set((state) => {
      if (!state.columns) return state;
      const columns = { ...state.columns };
      for (const col of Object.keys(columns) as ApplicationStatus[]) {
        columns[col] = columns[col].filter((c) => c.id !== cardId);
      }
      return { columns };
    }),
  addCard: (card) =>
    set((state) => {
      if (!state.columns) return state;
      const columns = { ...state.columns };
      columns[card.boardColumn] = [...columns[card.boardColumn], card].sort(
        (a, b) => a.columnOrder - b.columnOrder
      );
      return { columns };
    }),
}));
