import { z } from 'zod';

export const prioritySchema = z.enum(['high', 'medium', 'low']);

export const labelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export const assigneeSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assignee: assigneeSchema.nullable(),
  labels: z.array(labelSchema),
  dueDate: z.string().nullable(),
  priority: prioritySchema,
  columnId: z.string(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const columnSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  color: z.string(),
});

import { PRESET_ASSIGNEES } from './constants';

export const boardSchema = z.object({
  columns: z.array(columnSchema),
  tasks: z.array(taskSchema),
  assignees: z.array(assigneeSchema).optional().default(PRESET_ASSIGNEES),
});
