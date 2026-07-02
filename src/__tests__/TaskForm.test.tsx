import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders create mode by default', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });

  it('renders edit mode', () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{ title: 'Mon titre', description: 'Ma desc' }}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mon titre')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ma desc')).toBeInTheDocument();
  });

  it('shows cancel button only when onCancel provided', () => {
    const { rerender } = render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument();

    rerender(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel clicked', async () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows validation error when submitting empty title', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
  });

  it('clears validation error when user types', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Titre'), 'a');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onSubmit with trimmed values', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Titre'), '  Ma tâche  ');
    await userEvent.type(screen.getByLabelText('Description'), '  Ma desc  ');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Ma tâche', description: 'Ma desc' });
  });

  it('omits description from payload when empty', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Titre'), 'Titre seul');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Titre seul', description: undefined });
  });

  it('resets fields after create submit', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    const titleInput = screen.getByLabelText('Titre');
    await userEvent.type(titleInput, 'Ma tâche');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(titleInput).toHaveValue('');
  });

  it('does not reset fields after edit submit', async () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{ title: 'Titre initial' }}
        onCancel={vi.fn()}
      />
    );
    const titleInput = screen.getByLabelText('Titre');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Titre modifié');
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(titleInput).toHaveValue('Titre modifié');
  });

  it('does not call onSubmit when title is only whitespace', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Titre'), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
