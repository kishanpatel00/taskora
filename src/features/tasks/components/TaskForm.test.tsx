import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { Button } from '@/components/ui/Button'
import { selectAllTasks } from '@/features/tasks/taskSelectors'
import { renderWithProviders } from '@/test/renderWithProviders'
import { makeProject } from '@/test/factories'
import { emptyTaskFormValues } from '../schemas/taskFormSchema'
import { TaskForm } from './TaskForm'

function renderForm(onSubmit = vi.fn()) {
  renderWithProviders(
    <TaskForm
      initialValues={emptyTaskFormValues()}
      projects={[makeProject({ id: 'p1', name: 'Portfolio' })]}
      submitLabel="Create task"
      onSubmit={onSubmit}
      onCancel={vi.fn()}
    />,
  )
  return onSubmit
}

describe('TaskForm', () => {
  it('shows a validation message and does not submit an empty title', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(await screen.findByText('Task title is required')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates the due date against the start date and keeps typed values', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()
    await user.type(screen.getByLabelText(/title/i), 'Write release notes')
    await user.type(screen.getByLabelText('Start date'), '2026-10-20')
    await user.type(screen.getByLabelText('Due date'), '2026-10-10')
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(await screen.findByText('Due date cannot be before the start date')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toHaveValue('Write release notes')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a complete task with tags and subtasks', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()
    await user.type(screen.getByLabelText(/title/i), '  Build hero section ')
    await user.selectOptions(screen.getByLabelText('Project'), 'p1')
    await user.selectOptions(screen.getByLabelText('Priority'), 'urgent')
    await user.type(screen.getByLabelText('Estimate (minutes)'), '90')
    await user.type(screen.getByLabelText('Tags'), 'Frontend{Enter}')
    await user.type(screen.getByLabelText('New subtask'), 'Layout grid{Enter}')
    await user.click(screen.getByRole('button', { name: 'Create task' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      title: 'Build hero section',
      projectId: 'p1',
      priority: 'urgent',
      estimatedMinutes: 90,
      tags: ['frontend'],
      subtasks: [{ title: 'Layout grid', completed: false }],
    })
  })
})

function NewTaskButton() {
  const { openCreateTask } = useDialogs()
  return <Button onClick={() => openCreateTask()}>Open new task</Button>
}

describe('task creation through the dialog', () => {
  it('creates a task in the store and closes the dialog', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<NewTaskButton />)
    await user.click(screen.getByRole('button', { name: 'Open new task' }))
    const dialog = screen.getByRole('dialog', { name: 'New task' })
    expect(within(dialog).getByLabelText(/title/i)).toHaveFocus()

    await user.type(within(dialog).getByLabelText(/title/i), 'Call the bank')
    await user.click(within(dialog).getByRole('button', { name: 'Create task' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(selectAllTasks(store.getState()).map((task) => task.title)).toEqual(['Call the bank'])
  })

  it('closes on Escape without creating anything', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<NewTaskButton />)
    await user.click(screen.getByRole('button', { name: 'Open new task' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(selectAllTasks(store.getState())).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Open new task' })).toHaveFocus()
  })
})
