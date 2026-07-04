'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/ThemeProvider';

const Board = dynamic(() => import('@/components/Board'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-color)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-center text-[var(--text-color)]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M9 3v18M15 3v18M3 3h18v18H3V3z" />
          </svg>
        </div>
        <div className="text-[10px] font-mono font-bold text-[var(--text-color)] uppercase tracking-widest animate-pulse">
          LOADING...
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <ThemeProvider>
      <main id="kanban-app" role="main" aria-label="Kanban Board Application">
        <Board />
      </main>
    </ThemeProvider>
  );
}
