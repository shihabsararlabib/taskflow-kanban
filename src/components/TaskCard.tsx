'use client';

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { formatDate, getInitials, getAvatarColor, cn } from '@/lib/utils';
import { PRIORITY_CONFIG } from '@/lib/constants';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export default function TaskCard({ task, onClick, onDelete, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isSortableDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.05 : 1,
      }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative border cursor-grab active:cursor-grabbing',
        'bg-[var(--card-bg)] text-[var(--text-color)]',
        'border-[var(--border-color)]',
        'hover:border-[var(--text-color)] rounded-none shadow-none',
        'transition-all duration-200',
        isSortableDragging && 'opacity-50 ring-1 ring-[var(--text-color)] bg-[var(--text-color)]/5'
      )}
      onClick={(e) => {
        // Don't open modal if dragging
        if (isSortableDragging) return;
        onClick();
      }}
      role="button"
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. ${task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Priority indicator stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: priorityConfig.color }}
      />

      <div className="p-3.5 pt-4">
        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center px-1.5 py-0.5 border text-[9px] font-mono font-bold tracking-widest uppercase"
                style={{
                  backgroundColor: 'transparent',
                  color: label.color,
                  borderColor: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-sans font-bold text-[var(--text-color)] mb-2 line-clamp-2 leading-tight">
          {task.title}
        </h3>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {task.description.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            {/* Priority badge */}
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-widest"
              style={{
                backgroundColor: 'transparent',
                color: priorityConfig.color,
                borderColor: priorityConfig.color,
              }}
            >
              <span className="text-[8px]">{priorityConfig.icon}</span>
              {priorityConfig.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border',
                  isOverdue
                    ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                    : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)]'
                )}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {/* Assignee avatar */}
          <div className="flex items-center gap-1.5">
            {task.assignee && (
              <div
                className="w-6 h-6 border border-[var(--border-color)] flex items-center justify-center text-[10px] font-mono font-bold"
                style={{ backgroundColor: getAvatarColor(task.assignee.name), color: 'white' }}
                title={task.assignee.name}
              >
                {getInitials(task.assignee.name)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 w-6 h-6 border border-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-color)] text-[var(--text-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]"
        aria-label={`Delete task: ${task.title}`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}
