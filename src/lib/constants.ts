import { Column, Label, Assignee } from '@/types';

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', order: 0, color: '#6366f1' },
  { id: 'todo', title: 'Todo', order: 1, color: '#8b5cf6' },
  { id: 'in-progress', title: 'In Progress', order: 2, color: '#f59e0b' },
  { id: 'review', title: 'Review', order: 3, color: '#3b82f6' },
  { id: 'done', title: 'Done', order: 4, color: '#10b981' },
];

export const PRESET_LABELS: Label[] = [
  { id: 'bug', name: 'Bug', color: '#ef4444' },
  { id: 'feature', name: 'Feature', color: '#3b82f6' },
  { id: 'enhancement', name: 'Enhancement', color: '#8b5cf6' },
  { id: 'documentation', name: 'Documentation', color: '#06b6d4' },
  { id: 'design', name: 'Design', color: '#ec4899' },
  { id: 'urgent', name: 'Urgent', color: '#f97316' },
  { id: 'backend', name: 'Backend', color: '#6366f1' },
  { id: 'frontend', name: 'Frontend', color: '#14b8a6' },
];

export const PRESET_ASSIGNEES: Assignee[] = [
  { id: 'user-1', name: 'Alex Morgan' },
  { id: 'user-2', name: 'Sam Chen' },
  { id: 'user-3', name: 'Jordan Lee' },
  { id: 'user-4', name: 'Taylor Kim' },
  { id: 'user-5', name: 'Riley Park' },
];

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#ef4444', bgColor: '#fef2f2', icon: '🔴' },
  medium: { label: 'Medium', color: '#f59e0b', bgColor: '#fffbeb', icon: '🟡' },
  low: { label: 'Low', color: '#10b981', bgColor: '#ecfdf5', icon: '🟢' },
} as const;

export const STORAGE_KEY = 'kanban-board-data';
export const THEME_STORAGE_KEY = 'kanban-theme';
