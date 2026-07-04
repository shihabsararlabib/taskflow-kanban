'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { Board, Task, FilterState } from '@/types';
import { useBoardStore } from '@/store/boardStore';
import { boardSchema } from '@/lib/schema';

export function useKanbanBoard() {
  const store = useBoardStore();

  const getFilteredTasks = useCallback(
    (filter: FilterState) => {
      return store.board.tasks.filter((task) => {
        if (filter.search) {
          const search = filter.search.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(search);
          const matchesDescription = task.description.toLowerCase().includes(search);
          const matchesAssignee = task.assignee?.name.toLowerCase().includes(search);
          if (!matchesTitle && !matchesDescription && !matchesAssignee) return false;
        }
        if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
        if (filter.label !== 'all' && !task.labels.some((l) => l.id === filter.label)) return false;
        if (filter.assignee !== 'all' && task.assignee?.id !== filter.assignee) return false;
        return true;
      });
    },
    [store.board.tasks]
  );

  const getTasksByColumn = useCallback(
    (columnId: string, filter: FilterState) => {
      return getFilteredTasks(filter)
        .filter((t) => t.columnId === columnId)
        .sort((a, b) => a.order - b.order);
    },
    [getFilteredTasks]
  );

  const exportBoard = useCallback(() => {
    const data = JSON.stringify(store.board, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [store.board]);

  const importBoard = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const result = boardSchema.safeParse(data);
          if (result.success) {
            store.importBoard(result.data as Board);
          } else {
            console.error('Validation error:', result.error);
            alert('Invalid board data format.');
          }
        } catch (error) {
          console.error('Failed to import board:', error);
          alert('Invalid JSON file. Please check the format.');
        }
      };
      reader.readAsText(file);
    },
    [store]
  );

  const stats = useMemo(() => {
    const total = store.board.tasks.length;
    const byColumn = store.board.columns.map((col) => ({
      ...col,
      count: store.board.tasks.filter((t) => t.columnId === col.id).length,
    }));
    return { total, byColumn };
  }, [store.board]);

  // Handle cross-tab synchronization manually for Zustand
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kanban-board-storage' && e.newValue) {
        useBoardStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    board: store.board,
    addTask: store.addTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    moveTask: store.moveTask,
    addColumn: store.addColumn,
    deleteColumn: store.deleteColumn,
    addAssignee: store.addAssignee,
    deleteAssignee: store.deleteAssignee,
    getTasksByColumn,
    getFilteredTasks,
    exportBoard,
    importBoard,
    undo: store.undo,
    redo: store.redo,
    canUndo: store.historyIndex > 0,
    canRedo: store.historyIndex < store.history.length - 1,
    stats,
  };
}


