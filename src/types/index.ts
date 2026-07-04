export type Priority = 'high' | 'medium' | 'low';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: Assignee | null;
  labels: Label[];
  dueDate: string | null;
  priority: Priority;
  columnId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  color: string;
}

export interface Board {
  columns: Column[];
  tasks: Task[];
  assignees?: Assignee[];
}

export interface BoardAction {
  type: string;
  payload: Board;
  timestamp: number;
  description: string;
}

export interface FilterState {
  search: string;
  priority: Priority | 'all';
  label: string | 'all';
  assignee: string | 'all';
}
