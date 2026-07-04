'use client';

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (e.key !== 'Escape') return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
