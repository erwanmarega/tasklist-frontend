import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
  id: 1,
  title: 'Test',
  description: null,
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

function mockFetch(ok: boolean, body: unknown, status = ok ? 200 : 400) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(String(body)),
    })
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('taskApi', () => {
  describe('getTasks', () => {
    it('returns array on success', async () => {
      mockFetch(true, [mockTask]);
      const tasks = await getTasks();
      expect(tasks).toEqual([mockTask]);
      expect(fetch).toHaveBeenCalledWith('/api/tasks');
    });

    it('throws on HTTP error', async () => {
      mockFetch(false, 'Not found', 404);
      await expect(getTasks()).rejects.toThrow('HTTP 404');
    });
  });

  describe('getTask', () => {
    it('returns single task', async () => {
      mockFetch(true, mockTask);
      const task = await getTask(1);
      expect(task).toEqual(mockTask);
      expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
    });

    it('throws on HTTP error', async () => {
      mockFetch(false, 'Not found', 404);
      await expect(getTask(99)).rejects.toThrow('HTTP 404');
    });
  });

  describe('createTask', () => {
    it('sends POST with body and returns created task', async () => {
      mockFetch(true, { ...mockTask, title: 'New task' });
      const task = await createTask({ title: 'New task', description: 'desc' });
      expect(task.title).toBe('New task');
      const call = vi.mocked(fetch).mock.calls[0];
      expect(call[0]).toBe('/api/tasks');
      expect(call[1]).toMatchObject({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New task', description: 'desc' }),
      });
    });

    it('throws on HTTP error', async () => {
      mockFetch(false, 'Bad request', 400);
      await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400');
    });
  });

  describe('updateTask', () => {
    it('sends PUT with partial body and returns updated task', async () => {
      const updated = { ...mockTask, completed: true };
      mockFetch(true, updated);
      const task = await updateTask(1, { completed: true });
      expect(task.completed).toBe(true);
      const call = vi.mocked(fetch).mock.calls[0];
      expect(call[0]).toBe('/api/tasks/1');
      expect(call[1]).toMatchObject({
        method: 'PUT',
        body: JSON.stringify({ completed: true }),
      });
    });

    it('throws on HTTP error', async () => {
      mockFetch(false, 'Server error', 500);
      await expect(updateTask(1, { title: 'x' })).rejects.toThrow('HTTP 500');
    });
  });

  describe('deleteTask', () => {
    it('sends DELETE request', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 204 })
      );
      await deleteTask(1);
      expect(fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });
    });

    it('throws on HTTP error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          text: () => Promise.resolve('Not found'),
        })
      );
      await expect(deleteTask(99)).rejects.toThrow('HTTP 404');
    });
  });
});
