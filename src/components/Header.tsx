'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onAddColumn: (title: string, color: string) => void;
  totalTasks: number;
}

export default function Header({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  onImport,
  onAddColumn,
  totalTasks,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const [columnColor, setColumnColor] = useState('#6366f1');
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleAddColumn = () => {
    if (columnTitle.trim()) {
      onAddColumn(columnTitle.trim(), columnColor);
      setColumnTitle('');
      setShowAddColumn(false);
    }
  };

  const shortcuts = [
    { key: 'N', description: 'New task' },
    { key: 'Esc', description: 'Close modal' },
    { key: 'Ctrl+Z', description: 'Undo' },
    { key: 'Ctrl+Shift+Z', description: 'Redo' },
    { key: 'Ctrl+E', description: 'Export board' },
    { key: '?', description: 'Show shortcuts' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-color)] border-b border-[var(--border-color)]">
      <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[var(--border-color)] flex items-center justify-center bg-[var(--card-bg)] text-[var(--accent-color)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M9 3v18M15 3v18M3 3h18v18H3V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold font-dot tracking-widest text-[var(--text-color)] leading-none uppercase">
                TaskFlow
              </h1>
              <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">
                [{totalTasks}] TASKS ACTIVE
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Redo"
                title="Redo (Ctrl+Shift+Z)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* Add Column */}
            <div className="relative">
              <button
                onClick={() => setShowAddColumn(!showAddColumn)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] text-[10px] font-mono font-bold text-[var(--text-color)] uppercase tracking-wider hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors"
                aria-label="Add column"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                </svg>
                Column
              </button>
              <AnimatePresence>
                {showAddColumn && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 w-64 p-3 bg-[var(--card-bg)] border border-[var(--border-color)] z-50 rounded-none shadow-none"
                  >
                    <p className="text-[10px] font-mono font-bold text-[var(--text-color)] mb-2 uppercase tracking-wider">
                      New Column
                    </p>
                    <input
                      type="text"
                      value={columnTitle}
                      onChange={(e) => setColumnTitle(e.target.value)}
                      placeholder="NAME..."
                      className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-color)] text-xs font-mono text-[var(--text-color)] focus:outline-none focus:border-[var(--accent-color)] mb-3 uppercase"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddColumn();
                      }}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mb-4">
                      <label htmlFor="column-color" className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-color)]">COLOR:</label>
                      <input
                        id="column-color"
                        type="color"
                        value={columnColor}
                        onChange={(e) => setColumnColor(e.target.value)}
                        className="w-6 h-6 cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </div>
                    <button
                      onClick={handleAddColumn}
                      disabled={!columnTitle.trim()}
                      className="w-full py-2 text-[10px] font-mono font-bold text-white bg-[var(--accent-color)] hover:bg-[var(--text-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wider border-0"
                    >
                      ADD
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Import/Export */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={onExport}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                aria-label="Export board"
                title="Export board (Ctrl+E)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                aria-label="Import board"
                title="Import board"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImport(file);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Keyboard shortcuts */}
            <div className="relative">
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts (?)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <AnimatePresence>
                {showShortcuts && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50"
                  >
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      ⌨️ Keyboard Shortcuts
                    </p>
                    <div className="space-y-1.5">
                      {shortcuts.map((s) => (
                        <div key={s.key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {s.description}
                          </span>
                          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {s.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-[var(--border-color)] mx-1 hidden sm:block" />

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
