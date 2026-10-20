import type { Project } from '@/features/projects/projectTypes'
import type { Task, TaskInput } from '@/features/tasks/taskTypes'

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task_1',
    title: 'Write tests',
    description: '',
    projectId: null,
    status: 'todo',
    priority: 'medium',
    startDate: null,
    dueDate: null,
    tags: [],
    estimatedMinutes: null,
    subtasks: [],
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    completedAt: null,
    order: 0,
    ...overrides,
  }
}

export function makeTaskInput(overrides: Partial<TaskInput> = {}): TaskInput {
  return {
    title: 'New task',
    description: '',
    projectId: null,
    status: 'todo',
    priority: 'medium',
    startDate: null,
    dueDate: null,
    tags: [],
    estimatedMinutes: null,
    subtasks: [],
    ...overrides,
  }
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project_1',
    name: 'Portfolio',
    description: '',
    color: 'indigo',
    icon: 'code',
    status: 'active',
    startDate: null,
    dueDate: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    ...overrides,
  }
}
