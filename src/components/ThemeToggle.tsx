'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-[72px] h-8 border border-[var(--border-color)] flex items-center justify-center font-mono text-[10px] font-bold text-[var(--text-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors uppercase tracking-widest"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      role="switch"
      aria-checked={theme === 'dark'}
    >
      {theme === 'dark' ? 'LIGHT' : 'DARK'}
    </button>
  );
}
