'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Task, FilterState } from '@/types';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  filter: FilterState;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  filter,
  onTaskClick,
  onDeleteTask,
  onAddTask,
  onDeleteColumn,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 w-[320px] md:w-[300px] flex flex-col h-full max-h-full"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1 border-b border-[var(--border-color)] pb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 border border-current"
            style={{ backgroundColor: column.color, color: column.color }}
          />
          <h2 className="text-sm font-dot text-[var(--text-color)] uppercase tracking-widest leading-none">
            {column.title}
          </h2>
          <span className="flex items-center justify-center px-1.5 border border-[var(--border-color)] text-[10px] font-mono font-bold bg-[var(--bg-color)] text-[var(--text-color)]">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(column.id)}
            className="w-6 h-6 border border-transparent hover:border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] transition-colors"
            aria-label={`Add task to ${column.title}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {column.id !== 'backlog' &&
            column.id !== 'todo' &&
            column.id !== 'in-progress' &&
            column.id !== 'review' &&
            column.id !== 'done' && (
              <button
                onClick={() => onDeleteColumn(column.id)}
                className="w-6 h-6 border border-transparent hover:border-[var(--accent-color)] flex items-center justify-center text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors"
                aria-label={`Delete column ${column.title}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
        </div>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden p-2 transition-all duration-200 space-y-3 min-h-[120px] h-full ${
          isOver
            ? 'bg-[var(--text-color)]/5 ring-1 ring-[var(--accent-color)]'
            : ''
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color) transparent',
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-12 h-12 border border-[var(--border-color)] flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--border-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[10px] font-mono text-[var(--border-color)] uppercase tracking-wider font-bold">
              {filter.search || filter.priority !== 'all' || filter.label !== 'all'
                ? 'NO MATCH'
                : 'EMPTY'}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
