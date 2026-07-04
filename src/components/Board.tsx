'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Task, FilterState } from '@/types';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { generateId } from '@/lib/utils';
import Header from './Header';
import KanbanColumn from './Column';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import SearchFilter from './SearchFilter';

export default function Board() {
  const {
    board,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    deleteColumn,
    getTasksByColumn,
    exportBoard,
    importBoard,
    undo,
    redo,
    canUndo,
    canRedo,
    stats,
  } = useKanbanBoard();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(false);
  const [newTaskColumnId, setNewTaskColumnId] = useState('backlog');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    priority: 'all',
    label: 'all',
    assignee: 'all',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = active.data?.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeTask = active.data?.current?.task as Task | undefined;
      if (!activeTask) return;

      const overType = over.data?.current?.type;
      const overColumnId = overType === 'column'
        ? (over.id as string)
        : (over.data?.current?.task as Task)?.columnId;

      if (!overColumnId) return;

      // If dragging over a different column, move the task there
      if (activeTask.columnId !== overColumnId) {
        const overTasks = board.tasks
          .filter((t) => t.columnId === overColumnId && t.id !== activeTask.id)
          .sort((a, b) => a.order - b.order);

        let targetIndex = overTasks.length;

        if (overType === 'task') {
          const overTask = over.data?.current?.task as Task;
          const overIndex = overTasks.findIndex((t) => t.id === overTask.id);
          targetIndex = overIndex >= 0 ? overIndex : overTasks.length;
        }

        moveTask(activeTask.id, overColumnId, targetIndex);
      }
    },
    [board.tasks, moveTask]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeTask = active.data?.current?.task as Task | undefined;
      if (!activeTask) return;

      const overType = over.data?.current?.type;

      if (overType === 'task') {
        const overTask = over.data?.current?.task as Task;

        if (active.id !== over.id && activeTask.columnId === overTask.columnId) {
          const columnTasks = board.tasks
            .filter((t) => t.columnId === activeTask.columnId)
            .sort((a, b) => a.order - b.order);

          const overIndex = columnTasks.findIndex((t) => t.id === overTask.id);
          moveTask(activeTask.id, activeTask.columnId, overIndex);
        }
      } else if (overType === 'column') {
        const overColumnId = over.id as string;
        const overTasks = board.tasks
          .filter((t) => t.columnId === overColumnId && t.id !== activeTask.id)
          .sort((a, b) => a.order - b.order);

        moveTask(activeTask.id, overColumnId, overTasks.length);
      }
    },
    [board.tasks, moveTask]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setIsModalOpen(true);
  }, []);

  const handleAddTask = useCallback((columnId: string) => {
    setSelectedTask(null);
    setIsNewTask(true);
    setNewTaskColumnId(columnId);
    setIsModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(
    (task: Task) => {
      if (isNewTask) {
        addTask({
          title: task.title,
          description: task.description,
          assignee: task.assignee,
          labels: task.labels,
          dueDate: task.dueDate,
          priority: task.priority,
          columnId: task.columnId,
        });
      } else {
        updateTask(task.id, task);
      }
    },
    [isNewTask, addTask, updateTask]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  // Keyboard shortcuts
  const shortcuts = useMemo(
    () => [
      { key: 'n', handler: () => handleAddTask('backlog'), description: 'New task' },
      { key: 'Escape', handler: handleCloseModal, description: 'Close modal' },
      { key: 'z', ctrl: true, handler: undo, description: 'Undo' },
      { key: 'z', ctrl: true, shift: true, handler: redo, description: 'Redo' },
      { key: 'e', ctrl: true, handler: exportBoard, description: 'Export board' },
    ],
    [handleAddTask, handleCloseModal, undo, redo, exportBoard]
  );

  useKeyboardShortcuts(shortcuts);

  // Pre-compute tasks per column
  const columnTasks = useMemo(() => {
    const result: Record<string, Task[]> = {};
    for (const col of board.columns) {
      result[col.id] = getTasksByColumn(col.id, filter);
    }
    return result;
  }, [board.columns, getTasksByColumn, filter]);

  const filteredTaskCount = useMemo(
    () => Object.values(columnTasks).reduce((sum, tasks) => sum + tasks.length, 0),
    [columnTasks]
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExport={exportBoard}
        onImport={importBoard}
        onAddColumn={addColumn}
        totalTasks={stats.total}
      />

      {/* Search and Filter */}
      <div className="px-4 md:px-6 py-3 max-w-[1800px] mx-auto w-full">
        <SearchFilter filter={filter} onFilterChange={setFilter} taskCount={filteredTaskCount} />
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 md:px-6 pb-4">
          <motion.div
            className="flex gap-4 h-full min-w-min pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, staggerChildren: 0.1 }}
          >
            {board.columns
              .sort((a, b) => a.order - b.order)
              .map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks[column.id] || []}
                  filter={filter}
                  onTaskClick={handleTaskClick}
                  onDeleteTask={deleteTask}
                  onAddTask={handleAddTask}
                  onDeleteColumn={deleteColumn}
                />
              ))}

            {/* Add column placeholder (mobile-friendly) */}
            <div className="flex-shrink-0 w-[320px] md:w-[300px]">
              {isAddingColumn ? (
                <div className="w-full p-3 border border-[var(--border-color)] bg-[var(--card-bg)]">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="COLUMN NAME..."
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-color)] text-xs font-mono text-[var(--text-color)] focus:outline-none focus:border-[var(--accent-color)] mb-3 uppercase"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newColumnTitle.trim()) {
                        addColumn(newColumnTitle.trim().toUpperCase(), '#ea2e2e');
                        setNewColumnTitle('');
                        setIsAddingColumn(false);
                      } else if (e.key === 'Escape') {
                        setIsAddingColumn(false);
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAddingColumn(false)}
                      className="flex-1 py-2 text-[10px] font-mono font-bold text-[var(--text-color)] border border-[var(--border-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors uppercase tracking-wider"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        if (newColumnTitle.trim()) {
                          addColumn(newColumnTitle.trim().toUpperCase(), '#ea2e2e');
                          setNewColumnTitle('');
                          setIsAddingColumn(false);
                        }
                      }}
                      disabled={!newColumnTitle.trim()}
                      className="flex-1 py-2 text-[10px] font-mono font-bold text-white bg-[var(--accent-color)] hover:bg-[var(--text-color)] disabled:opacity-40 transition-colors uppercase tracking-wider border-0"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-[120px] border border-[var(--border-color)] bg-transparent flex flex-col items-center justify-center gap-3 text-[var(--text-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors group"
                  aria-label="Add new column"
                >
                  <div className="w-8 h-8 border border-current flex items-center justify-center group-hover:bg-[var(--text-color)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">ADD COLUMN</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 opacity-90">
              <TaskCard
                task={activeTask}
                onClick={() => {}}
                onDelete={() => {}}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={deleteTask}
        isNewTask={isNewTask}
        defaultColumnId={newTaskColumnId}
      />
    </div>
  );
}
