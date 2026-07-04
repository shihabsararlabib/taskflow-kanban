'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Task, Priority, Label, Assignee } from '@/types';
import { PRIORITY_CONFIG, PRESET_LABELS, PRESET_ASSIGNEES } from '@/lib/constants';
import { getInitials, getAvatarColor, cn } from '@/lib/utils';
import { useBoardStore } from '@/store/boardStore';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isNewTask?: boolean;
  defaultColumnId?: string;
}

export default function TaskModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNewTask = false,
  defaultColumnId = 'backlog',
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [labels, setLabels] = useState<Label[]>([]);
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState('');

  const assignees = useBoardStore(state => state.board.assignees) || PRESET_ASSIGNEES;
  const addAssignee = useBoardStore(state => state.addAssignee);
  const deleteAssignee = useBoardStore(state => state.deleteAssignee);

  const titleRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[100px] max-h-[200px] overflow-y-auto p-3 text-sm text-[var(--text-color)] focus:outline-none prose prose-sm dark:prose-invert max-w-none font-sans',
      },
    },
  });

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setLabels(task.labels);
      setAssignee(task.assignee);
      setDueDate(task.dueDate || '');
      if (editor) editor.commands.setContent(task.description || '');
    } else if (isOpen && isNewTask) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setLabels([]);
      setAssignee(null);
      setDueDate('');
      setDueDate('');
      setShowLabelPicker(false);
      setShowAssigneePicker(false);
      setNewAssigneeName('');
      if (editor) editor.commands.setContent('');
    }
  }, [isOpen, task, isNewTask, editor]);

  // Focus title and set description content when modal opens
  useEffect(() => {
    if (isOpen) {
      // Intentionally avoiding auto-focus here to prevent modal jitter
    }
  }, [isOpen, task, isNewTask]);

  const handleSave = useCallback(() => {
    if (!title.trim()) return;

    const descContent = editor?.getHTML() || description;

    const updatedTask: Task = {
      id: task?.id || '',
      title: title.trim(),
      description: descContent,
      priority,
      labels,
      assignee,
      dueDate: dueDate || null,
      columnId: task?.columnId || defaultColumnId,
      order: task?.order || 0,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedTask);
    onClose();
  }, [title, description, priority, labels, assignee, dueDate, task, defaultColumnId, onSave, onClose]);

  const toggleLabel = (label: Label) => {
    setLabels((prev) =>
      prev.some((l) => l.id === label.id)
        ? prev.filter((l) => l.id !== label.id)
        : [...prev, label]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-color)]/90"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={isNewTask ? 'Create new task' : 'Edit task'}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--card-bg)] border border-[var(--border-color)] shadow-none rounded-none"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-5 pb-3 border-b border-[var(--border-color)] bg-[var(--card-bg)] z-10">
              <h2 className="text-xl font-dot text-[var(--text-color)] uppercase tracking-widest leading-none mt-1">
                {isNewTask ? 'CREATE TASK' : 'EDIT TASK'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 border border-transparent hover:border-[var(--accent-color)] flex items-center justify-center text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="task-title" className="block text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest mb-1.5 border-b border-[var(--border-color)] pb-1">
                  TITLE
                </label>
                <input
                  ref={titleRef}
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="WHAT NEEDS TO BE DONE?"
                  className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] placeholder-gray-400 focus:outline-none focus:border-[var(--accent-color)] transition-colors font-sans text-sm rounded-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
              </div>

              {/* Description with rich text */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest mb-1.5 border-b border-[var(--border-color)] pb-1">
                  DESCRIPTION
                </label>
                <div className="border border-[var(--border-color)] bg-[var(--bg-color)] rounded-none">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={cn(
                        'w-7 h-7 flex items-center justify-center text-[12px] font-mono font-bold transition-colors border',
                        editor?.isActive('bold')
                          ? 'bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]'
                          : 'bg-transparent text-[var(--text-color)] border-transparent hover:border-[var(--text-color)]'
                      )}
                      aria-label="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={cn(
                        'w-7 h-7 flex items-center justify-center text-[12px] font-mono italic transition-colors border',
                        editor?.isActive('italic')
                          ? 'bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]'
                          : 'bg-transparent text-[var(--text-color)] border-transparent hover:border-[var(--text-color)]'
                      )}
                      aria-label="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleStrike().run()}
                      className={cn(
                        'w-7 h-7 flex items-center justify-center text-[12px] font-mono line-through transition-colors border',
                        editor?.isActive('strike')
                          ? 'bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]'
                          : 'bg-transparent text-[var(--text-color)] border-transparent hover:border-[var(--text-color)]'
                      )}
                      aria-label="Strikethrough"
                    >
                      S
                    </button>
                    <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={cn(
                        'w-7 h-7 flex items-center justify-center transition-colors border',
                        editor?.isActive('bulletList')
                          ? 'bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]'
                          : 'bg-transparent text-[var(--text-color)] border-transparent hover:border-[var(--text-color)]'
                      )}
                      aria-label="Bullet list"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  {/* Editable area */}
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Priority & Due Date row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest mb-2 border-b border-[var(--border-color)] pb-1">
                    PRIORITY
                  </label>
                  <div className="flex gap-2">
                    {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                          priority === p
                            ? 'bg-transparent'
                            : 'bg-transparent hover:border-[var(--text-color)]'
                        )}
                        style={{
                          color: PRIORITY_CONFIG[p].color,
                          borderColor: priority === p ? PRIORITY_CONFIG[p].color : 'var(--border-color)',
                          ...(priority === p ? { backgroundColor: `${PRIORITY_CONFIG[p].color}15` } : {}),
                        }}
                      >
                        <span className="text-[10px]">{PRIORITY_CONFIG[p].icon}</span>
                        {PRIORITY_CONFIG[p].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="task-due-date" className="block text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest mb-2 border-b border-[var(--border-color)] pb-1">
                    DUE DATE
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--accent-color)] transition-colors text-sm font-mono uppercase rounded-none"
                  />
                </div>
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center justify-between mb-2 border-b border-[var(--border-color)] pb-1">
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest">
                    LABELS
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLabelPicker(!showLabelPicker)}
                    className="text-[10px] font-mono font-bold text-[var(--accent-color)] hover:text-[var(--text-color)] uppercase tracking-widest transition-colors"
                  >
                    {showLabelPicker ? 'HIDE' : 'SELECT'}
                  </button>
                </div>
                {/* Selected labels */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {labels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: 'transparent',
                        color: label.color,
                        borderColor: label.color,
                      }}
                      onClick={() => toggleLabel(label)}
                    >
                      {label.name}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  ))}
                  {labels.length === 0 && (
                    <span className="text-[10px] font-mono text-[var(--border-color)] uppercase tracking-widest font-bold">NONE</span>
                  )}
                </div>
                {/* Label picker */}
                <AnimatePresence>
                  {showLabelPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.1 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 p-3 border border-[var(--border-color)] bg-[var(--bg-color)] mt-2">
                        {PRESET_LABELS.map((label) => (
                          <button
                            key={label.id}
                            type="button"
                            onClick={() => toggleLabel(label)}
                            className={cn(
                              'inline-flex items-center px-2 py-1 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors',
                              labels.some((l) => l.id === label.id)
                                ? 'bg-transparent'
                                : 'bg-transparent hover:border-[var(--text-color)]'
                            )}
                            style={{
                              color: label.color,
                              borderColor: labels.some((l) => l.id === label.id) ? label.color : 'var(--border-color)',
                              ...(labels.some((l) => l.id === label.id) ? { backgroundColor: `${label.color}15` } : {}),
                            }}
                          >
                            {labels.some((l) => l.id === label.id) && (
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {label.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Assignee */}
              <div>
                <div className="flex items-center justify-between mb-2 border-b border-[var(--border-color)] pb-1">
                  <label className="block text-[10px] font-mono font-bold text-[var(--text-color)] opacity-50 uppercase tracking-widest">
                    ASSIGNEE
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                    className="text-[10px] font-mono font-bold text-[var(--accent-color)] hover:text-[var(--text-color)] uppercase tracking-widest transition-colors"
                  >
                    {showAssigneePicker ? 'HIDE' : 'SELECT'}
                  </button>
                </div>
                {/* Current assignee */}
                {assignee ? (
                  <div className="flex items-center gap-3 p-3 border border-[var(--border-color)] bg-[var(--bg-color)] mb-2">
                    <div
                      className="w-8 h-8 border border-[var(--border-color)] flex items-center justify-center text-[10px] font-mono font-bold text-white"
                      style={{ backgroundColor: getAvatarColor(assignee.name) }}
                    >
                      {getInitials(assignee.name)}
                    </div>
                    <span className="text-[12px] font-mono font-bold text-[var(--text-color)] uppercase tracking-widest">{assignee.name}</span>
                    <button
                      type="button"
                      onClick={() => setAssignee(null)}
                      className="ml-auto text-[var(--border-color)] hover:text-[var(--accent-color)] transition-colors"
                      aria-label="Remove assignee"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-[var(--border-color)] uppercase tracking-widest font-bold mb-2">NONE</p>
                )}
                {/* Assignee picker */}
                <AnimatePresence>
                  {showAssigneePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.1 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 border border-[var(--border-color)] bg-[var(--bg-color)] mt-2">
                        <div className="grid grid-cols-2 gap-2 mb-3 max-h-40 overflow-y-auto pr-1">
                          {assignees.map((a) => (
                            <div key={a.id} className="relative group flex">
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignee(a);
                                  setShowAssigneePicker(false);
                                }}
                                className={cn(
                                  'flex-1 flex items-center gap-2 p-2 border transition-all text-left rounded-none',
                                  assignee?.id === a.id
                                    ? 'bg-transparent text-[var(--accent-color)] border-[var(--accent-color)]'
                                    : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--text-color)]'
                                )}
                              >
                                <div
                                  className="w-6 h-6 border border-[var(--border-color)] flex items-center justify-center text-[8px] font-mono font-bold text-white flex-shrink-0"
                                  style={{ backgroundColor: getAvatarColor(a.name) }}
                                >
                                  {getInitials(a.name)}
                                </div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest truncate">
                                  {a.name}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (assignee?.id === a.id) setAssignee(null);
                                  deleteAssignee(a.id);
                                }}
                                className="absolute right-0 top-0 bottom-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-[var(--card-bg)] border-y border-r border-[var(--border-color)] text-red-500 hover:text-red-400"
                                aria-label="Delete assignee"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 items-center border-t border-[var(--border-color)] pt-3">
                          <input
                            type="text"
                            value={newAssigneeName}
                            onChange={(e) => setNewAssigneeName(e.target.value)}
                            placeholder="NEW ASSIGNEE..."
                            className="flex-1 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-color)] text-[10px] font-mono font-bold text-[var(--text-color)] placeholder-gray-500 focus:outline-none focus:border-[var(--accent-color)] uppercase tracking-widest"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newAssigneeName.trim()) {
                                e.preventDefault();
                                addAssignee(newAssigneeName.trim());
                                setNewAssigneeName('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={!newAssigneeName.trim()}
                            onClick={() => {
                              addAssignee(newAssigneeName.trim());
                              setNewAssigneeName('');
                            }}
                            className="px-3 py-1.5 border border-[var(--border-color)] bg-[var(--card-bg)] text-[10px] font-mono font-bold text-[var(--text-color)] uppercase tracking-widest hover:border-[var(--text-color)] disabled:opacity-50 transition-colors"
                          >
                            ADD
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-between p-5 pt-4 border-t border-[var(--border-color)] bg-[var(--card-bg)]">
              {!isNewTask && task && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                  className="px-4 py-2 border border-[var(--accent-color)] text-[10px] font-mono font-bold text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-colors uppercase tracking-widest"
                  aria-label="Delete task"
                >
                  DELETE
                </button>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-[var(--border-color)] text-[10px] font-mono font-bold text-[var(--text-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors uppercase tracking-widest"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-6 py-2 border border-[var(--accent-color)] bg-[var(--accent-color)] text-[10px] font-mono font-bold text-white hover:bg-transparent hover:text-[var(--accent-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
                >
                  {isNewTask ? 'CREATE' : 'SAVE'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
