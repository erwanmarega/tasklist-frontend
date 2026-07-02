import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';

const makeTask = (overrides = {}) => ({
  id: 1,
  title: 'Ma tâche',
  description: null,
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
  ...overrides,
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useTasks', () => {
  it('loads tasks on mount', async () => {
    const tasks = [makeTask({ id: 1 }), makeTask({ id: 2, title: 'Tâche 2' })];
    vi.spyOn(taskApi, 'getTasks').mockResolvedValue(tasks);

    const { result } = renderHook(() => useTasks());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual(tasks);
    expect(result.current.error).toBeNull();
  });

  it('sets error when load fails', async () => {
    vi.spyOn(taskApi, 'getTasks').mockRejectedValue(new Error('Réseau indisponible'));

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Réseau indisponible');
    expect(result.current.tasks).toEqual([]);
  });

  it('sets generic error for non-Error rejection', async () => {
    vi.spyOn(taskApi, 'getTasks').mockRejectedValue('boom');

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Une erreur est survenue');
  });

  it('addTask prepends new task to list', async () => {
    const existing = makeTask({ id: 1 });
    const newTask = makeTask({ id: 2, title: 'Nouvelle' });
    vi.spyOn(taskApi, 'getTasks').mockResolvedValue([existing]);
    vi.spyOn(taskApi, 'createTask').mockResolvedValue(newTask);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask({ title: 'Nouvelle' });
    });

    expect(result.current.tasks[0]).toEqual(newTask);
    expect(result.current.tasks[1]).toEqual(existing);
  });

  it('editTask replaces task in list', async () => {
    const original = makeTask({ id: 1 });
    const updated = makeTask({ id: 1, title: 'Modifiée' });
    vi.spyOn(taskApi, 'getTasks').mockResolvedValue([original]);
    vi.spyOn(taskApi, 'updateTask').mockResolvedValue(updated);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editTask(1, { title: 'Modifiée' });
    });

    expect(result.current.tasks[0].title).toBe('Modifiée');
  });

  it('removeTask removes task from list', async () => {
    const tasks = [makeTask({ id: 1 }), makeTask({ id: 2, title: 'Deux' })];
    vi.spyOn(taskApi, 'getTasks').mockResolvedValue(tasks);
    vi.spyOn(taskApi, 'deleteTask').mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeTask(1);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe(2);
  });

  it('toggleComplete flips completed state', async () => {
    const task = makeTask({ id: 1, completed: false });
    const toggled = { ...task, completed: true };
    vi.spyOn(taskApi, 'getTasks').mockResolvedValue([task]);
    vi.spyOn(taskApi, 'updateTask').mockResolvedValue(toggled);

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(1);
    });

    expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
    expect(result.current.tasks[0].completed).toBe(true);
  });

  it('toggleComplete does nothing for unknown id', async () => {
    vi.spyOn(taskApi, 'getTasks').mockResolvedValue([makeTask({ id: 1 })]);
    const updateSpy = vi.spyOn(taskApi, 'updateTask');

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(999);
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });
});
