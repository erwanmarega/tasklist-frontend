import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const task: Task = {
  id: 1,
  title: 'Ma tâche',
  description: 'Une description',
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

const defaultProps = {
  task,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

describe('TaskItem', () => {
  it('renders task title and description', () => {
    render(<TaskItem {...defaultProps} />);
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
    expect(screen.getByText('Une description')).toBeInTheDocument();
  });

  it('does not render description when null', () => {
    render(<TaskItem {...defaultProps} task={{ ...task, description: null }} />);
    expect(screen.queryByText('Une description')).not.toBeInTheDocument();
  });

  it('has completed class when task is completed', () => {
    render(<TaskItem {...defaultProps} task={{ ...task, completed: true }} />);
    expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
  });

  it('does not have completed class when not completed', () => {
    render(<TaskItem {...defaultProps} />);
    expect(screen.getByTestId('task-item')).not.toHaveClass('task-completed');
  });

  it('calls onToggle with task id when checkbox clicked', async () => {
    const onToggle = vi.fn();
    render(<TaskItem {...defaultProps} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('shows edit form when edit button clicked', async () => {
    render(<TaskItem {...defaultProps} />);
    await userEvent.click(screen.getByTitle('Modifier'));
    expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
    expect(screen.getByLabelText('Modifier la description')).toBeInTheDocument();
  });

  it('pre-fills edit form with current values', async () => {
    render(<TaskItem {...defaultProps} />);
    await userEvent.click(screen.getByTitle('Modifier'));
    expect(screen.getByLabelText('Modifier le titre')).toHaveValue('Ma tâche');
    expect(screen.getByLabelText('Modifier la description')).toHaveValue('Une description');
  });

  it('calls onEdit and exits edit mode on save', async () => {
    const onEdit = vi.fn();
    render(<TaskItem {...defaultProps} onEdit={onEdit} />);
    await userEvent.click(screen.getByTitle('Modifier'));
    const titleInput = screen.getByLabelText('Modifier le titre');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Titre modifié');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(onEdit).toHaveBeenCalledWith(1, { title: 'Titre modifié', description: 'Une description' });
    expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
  });

  it('does not call onEdit when title empty on save', async () => {
    const onEdit = vi.fn();
    render(<TaskItem {...defaultProps} onEdit={onEdit} />);
    await userEvent.click(screen.getByTitle('Modifier'));
    await userEvent.clear(screen.getByLabelText('Modifier le titre'));
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('restores original values and exits edit mode on cancel', async () => {
    render(<TaskItem {...defaultProps} />);
    await userEvent.click(screen.getByTitle('Modifier'));
    const titleInput = screen.getByLabelText('Modifier le titre');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Valeur temporaire');
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
  });

  it('requires confirmation before deleting', async () => {
    const onDelete = vi.fn();
    render(<TaskItem {...defaultProps} onDelete={onDelete} />);
    await userEvent.click(screen.getByTitle('Supprimer'));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTitle('Supprimer'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('shows warning icon on first delete click', async () => {
    render(<TaskItem {...defaultProps} />);
    const deleteBtn = screen.getByTitle('Supprimer');
    expect(deleteBtn).toHaveTextContent('🗑️');
    await userEvent.click(deleteBtn);
    expect(deleteBtn).toHaveTextContent('⚠️');
  });
});
