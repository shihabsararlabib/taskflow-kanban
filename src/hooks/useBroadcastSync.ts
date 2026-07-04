'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Board } from '@/types';

const CHANNEL_NAME = 'kanban-board-sync';

export function useBroadcastSync(
  board: Board,
  setBoard: (board: Board) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isReceiving = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);

      channelRef.current.onmessage = (event) => {
        if (event.data?.type === 'board-update') {
          isReceiving.current = true;
          setBoard(event.data.board);
          setTimeout(() => {
            isReceiving.current = false;
          }, 100);
        }
      };
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      channelRef.current?.close();
    };
  }, [setBoard]);

  const broadcast = useCallback(
    (updatedBoard: Board) => {
      if (isReceiving.current) return;
      try {
        channelRef.current?.postMessage({
          type: 'board-update',
          board: updatedBoard,
        });
      } catch {
        // ignore
      }
    },
    []
  );

  return { broadcast };
}
