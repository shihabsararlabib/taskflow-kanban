import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, Task, Column, FilterState } from '@/types';
import { generateId } from '@/lib/utils';
import { DEFAULT_COLUMNS, STORAGE_KEY, PRESET_ASSIGNEES } from '@/lib/constants';
import { boardSchema } from '@/lib/schema';

interface BoardState {
  board: Board;
  history: Board[];
  historyIndex: number;
  addTask: (task: Omit<Task, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetColumnId: string, targetIndex: number) => void;
  addColumn: (title: string, color: string) => void;
  deleteColumn: (columnId: string) => void;
  addAssignee: (name: string) => void;
  deleteAssignee: (assigneeId: string) => void;
  importBoard: (data: Board) => void;
  undo: () => void;
  redo: () => void;
}

const initialBoard: Board = {
  columns: DEFAULT_COLUMNS,
  tasks: [],
  assignees: PRESET_ASSIGNEES,
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      board: initialBoard,
      history: [initialBoard],
      historyIndex: 0,
      
      addTask: (task) => set((state) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...task,
          id: generateId(),
          order: state.board.tasks.filter((t) => t.columnId === task.columnId).length,
          createdAt: now,
          updatedAt: now,
        };
        const nextBoard = { ...state.board, tasks: [...state.board.tasks, newTask] };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      updateTask: (taskId, updates) => set((state) => {
        const nextBoard = {
          ...state.board,
          tasks: state.board.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      deleteTask: (taskId) => set((state) => {
        const nextBoard = {
          ...state.board,
          tasks: state.board.tasks.filter((t) => t.id !== taskId),
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      moveTask: (taskId, targetColumnId, targetIndex) => set((state) => {
        const task = state.board.tasks.find((t) => t.id === taskId);
        if (!task) return state;

        const tasksInTargetColumn = state.board.tasks
          .filter((t) => t.columnId === targetColumnId && t.id !== taskId)
          .sort((a, b) => a.order - b.order);

        tasksInTargetColumn.splice(targetIndex, 0, {
          ...task,
          columnId: targetColumnId,
          updatedAt: new Date().toISOString(),
        });

        const updatedTargetTasks = tasksInTargetColumn.map((t, i) => ({ ...t, order: i }));

        const otherTasks = state.board.tasks.filter(
          (t) => t.id !== taskId && t.columnId !== targetColumnId
        );

        const sourceColumnTasks = task.columnId !== targetColumnId
          ? otherTasks
              .filter((t) => t.columnId === task.columnId)
              .sort((a, b) => a.order - b.order)
              .map((t, i) => ({ ...t, order: i }))
          : [];

        const remainingTasks = otherTasks.filter((t) => t.columnId !== task.columnId);

        const nextBoard = {
          ...state.board,
          tasks: [...remainingTasks, ...sourceColumnTasks, ...updatedTargetTasks],
        };
        
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      addColumn: (title, color) => set((state) => {
        const newColumn: Column = {
          id: generateId(),
          title,
          order: state.board.columns.length,
          color,
        };
        const nextBoard = { ...state.board, columns: [...state.board.columns, newColumn] };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      deleteColumn: (columnId) => set((state) => {
        const nextBoard = {
          ...state.board,
          columns: state.board.columns.filter((c) => c.id !== columnId).map((c, i) => ({ ...c, order: i })),
          tasks: state.board.tasks.filter((t) => t.columnId !== columnId),
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      importBoard: (data) => set((state) => {
        // Ensure older imports have assignees
        const boardWithAssignees = { ...data, assignees: data.assignees || PRESET_ASSIGNEES };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: boardWithAssignees, history: [...newHistory, boardWithAssignees], historyIndex: state.historyIndex + 1 };
      }),

      addAssignee: (name) => set((state) => {
        const newAssignee = { id: generateId(), name };
        const nextBoard = { ...state.board, assignees: [...(state.board.assignees || []), newAssignee] };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      deleteAssignee: (assigneeId) => set((state) => {
        const nextBoard = {
          ...state.board,
          assignees: (state.board.assignees || []).filter((a) => a.id !== assigneeId),
          tasks: state.board.tasks.map(t => t.assignee?.id === assigneeId ? { ...t, assignee: null } : t),
        };
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        return { board: nextBoard, history: [...newHistory, nextBoard], historyIndex: state.historyIndex + 1 };
      }),

      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          return {
            historyIndex: state.historyIndex - 1,
            board: state.history[state.historyIndex - 1],
          };
        }
        return state;
      }),

      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          return {
            historyIndex: state.historyIndex + 1,
            board: state.history[state.historyIndex + 1],
          };
        }
        return state;
      }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ board: state.board }), // Only persist the board, not history
      onRehydrateStorage: () => (state) => {
        if (state) {
          const result = boardSchema.safeParse(state.board);
          if (!result.success) {
            console.warn('Persisted board data failed Zod validation. Resetting to initial.', result.error);
            state.board = initialBoard;
          } else {
            // Also reset history on reload
            state.history = [state.board];
            state.historyIndex = 0;
          }
        }
      }
    }
  )
);
