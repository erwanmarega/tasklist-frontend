import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types/task';

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Première tâche',
    description: 'Description 1',
    completed: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Deuxième tâche',
    description: null,
    completed: true,
    createdAt: '2026-01-16T10:00:00Z',
    updatedAt: '2026-01-16T10:00:00Z',
  },
];

const defaultProps = {
  tasks: mockTasks,
  loading: false,
  error: null,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

describe('TaskList', () => {
  it('shows loading state', () => {
    render(<TaskList {...defaultProps} tasks={[]} loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Chargement des tâches...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<TaskList {...defaultProps} tasks={[]} error="Connexion échouée" />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText(/Connexion échouée/)).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList {...defaultProps} tasks={[]} />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText('Aucune tâche')).toBeInTheDocument();
  });

  it('renders list of tasks', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Première tâche')).toBeInTheDocument();
    expect(screen.getByText('Deuxième tâche')).toBeInTheDocument();
    expect(screen.getByText('2 tâches')).toBeInTheDocument();
  });

  it('shows singular "tâche" for one task', () => {
    render(<TaskList {...defaultProps} tasks={[mockTasks[0]]} />);
    expect(screen.getByText('1 tâche')).toBeInTheDocument();
  });

  it('shows completed count', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.getByText('1 terminée')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn();
    render(<TaskList {...defaultProps} onToggle={onToggle} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('calls onDelete after double confirmation', async () => {
    const onDelete = vi.fn();
    render(<TaskList {...defaultProps} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByTitle('Supprimer');
    await userEvent.click(deleteButtons[0]);
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('loading takes priority over error', () => {
    render(<TaskList {...defaultProps} tasks={[]} loading={true} error="err" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });
});
