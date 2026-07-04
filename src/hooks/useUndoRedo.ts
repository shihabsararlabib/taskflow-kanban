'use client';

import { useCallback, useRef, useState } from 'react';
import { Board } from '@/types';

const MAX_HISTORY = 50;

export function useUndoRedo(board: Board, setBoard: (board: Board) => void) {
  const [undoStack, setUndoStack] = useState<Board[]>([]);
  const [redoStack, setRedoStack] = useState<Board[]>([]);
  const isUndoRedoAction = useRef(false);

  const pushToHistory = useCallback(
    (previousBoard: Board) => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }
      setUndoStack((prev) => {
        const next = [...prev, previousBoard];
        if (next.length > MAX_HISTORY) next.shift();
        return next;
      });
      setRedoStack([]);
    },
    []
  );

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const previousState = newStack.pop()!;
      setRedoStack((redo) => [...redo, { columns: [...board.columns], tasks: [...board.tasks] }]);
      isUndoRedoAction.current = true;
      setBoard(previousState);
      return newStack;
    });
  }, [board, setBoard]);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const nextState = newStack.pop()!;
      setUndoStack((undo) => [...undo, { columns: [...board.columns], tasks: [...board.tasks] }]);
      isUndoRedoAction.current = true;
      setBoard(nextState);
      return newStack;
    });
  }, [board, setBoard]);

  return {
    pushToHistory,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
