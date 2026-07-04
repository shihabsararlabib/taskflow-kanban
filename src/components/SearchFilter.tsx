'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FilterState, Priority } from '@/types';
import { PRIORITY_CONFIG, PRESET_LABELS, PRESET_ASSIGNEES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SearchFilterProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  taskCount: number;
}

export default function SearchFilter({ filter, onFilterChange, taskCount }: SearchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filter.priority !== 'all' || filter.label !== 'all' || filter.assignee !== 'all';

  const clearFilters = () => {
    onFilterChange({ search: '', priority: 'all', label: 'all', assignee: 'all' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            placeholder="SEARCH TASKS..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--border-color)] bg-transparent text-[var(--text-color)] placeholder-gray-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors font-mono text-xs uppercase"
            aria-label="Search tasks"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
            hasActiveFilters
              ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
              : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'
          )}
          aria-label="Toggle filters"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          FILTERS
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-white" />
          )}
        </button>

        {/* Task count */}
        <span className="text-[10px] font-mono text-[var(--border-color)] font-bold uppercase tracking-widest whitespace-nowrap">
          [{taskCount}] MATCHES
        </span>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-mono font-bold text-[var(--accent-color)] hover:text-white hover:bg-[var(--accent-color)] px-2 py-1 border border-transparent hover:border-[var(--accent-color)] transition-colors uppercase tracking-widest whitespace-nowrap"
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Filter chips */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-8 p-5 bg-[var(--card-bg)] border border-[var(--border-color)]">
              {/* Priority filter */}
              <div>
                <p className="text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest mb-3 border-b border-[var(--border-color)] pb-1">
                  PRIORITY
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onFilterChange({ ...filter, priority: 'all' })}
                    className={cn(
                      'px-3 py-1 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                      filter.priority === 'all'
                        ? 'bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]'
                        : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'
                    )}
                  >
                    ALL
                  </button>
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => onFilterChange({ ...filter, priority: p })}
                      className={cn(
                        'px-3 py-1 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                        filter.priority === p
                          ? 'bg-transparent'
                          : 'bg-transparent hover:border-[var(--text-color)]'
                      )}
                      style={{
                        color: PRIORITY_CONFIG[p].color,
                        borderColor: filter.priority === p ? PRIORITY_CONFIG[p].color : 'var(--border-color)',
                        ...(filter.priority === p ? { backgroundColor: `${PRIORITY_CONFIG[p].color}15` } : {}),
                      }}
                    >
                      {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label filter */}
              <div>
                <p className="text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest mb-3 border-b border-[var(--border-color)] pb-1">
                  LABEL
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onFilterChange({ ...filter, label: 'all' })}
                    className={cn(
                      'px-3 py-1 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                      filter.label === 'all'
                        ? 'bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]'
                        : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'
                    )}
                  >
                    ALL
                  </button>
                  {PRESET_LABELS.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => onFilterChange({ ...filter, label: label.id })}
                      className={cn(
                        'px-3 py-1 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                        filter.label === label.id
                          ? 'bg-transparent'
                          : 'bg-transparent hover:border-[var(--text-color)]'
                      )}
                      style={{
                        color: label.color,
                        borderColor: filter.label === label.id ? label.color : 'var(--border-color)',
                        ...(filter.label === label.id ? { backgroundColor: `${label.color}15` } : {}),
                      }}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee filter */}
              <div>
                <p className="text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest mb-3 border-b border-[var(--border-color)] pb-1">
                  ASSIGNEE
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onFilterChange({ ...filter, assignee: 'all' })}
                    className={cn(
                      'px-3 py-1 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                      filter.assignee === 'all'
                        ? 'bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]'
                        : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'
                    )}
                  >
                    ALL
                  </button>
                  {PRESET_ASSIGNEES.map((assignee) => (
                    <button
                      key={assignee.id}
                      onClick={() => onFilterChange({ ...filter, assignee: assignee.id })}
                      className={cn(
                        'px-3 py-1 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                        filter.assignee === assignee.id
                          ? 'bg-transparent text-[var(--accent-color)] border-[var(--accent-color)]'
                          : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--text-color)]'
                      )}
                    >
                      {assignee.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
