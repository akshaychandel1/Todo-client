import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: PriorityLevel;
  tags: string[];
  dueDate: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type FilterType = 'all' | 'today' | 'upcoming' | 'priority' | 'completed';

interface TodoContextType {
  todos: Todo[];
  filter: FilterType;
  searchQuery: string;
  selectedTagId: string | null;
  tags: Tag[];
  filteredTodos: Todo[];
  counts: Record<FilterType, number>;
  isLoading: boolean;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTagId: (id: string | null) => void;
  addTodo: (
    title: string,
    options?: { priority?: PriorityLevel; dueDate?: string | null; tags?: string[] },
  ) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  addTag: (data: { name: string; color: string }) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

function getTodayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [fetchedTodos, fetchedTags] = await Promise.all([
          api.get<Todo[]>('/todos'),
          api.get<Tag[]>('/tags'),
        ]);
        if (!cancelled) {
          setTodos(fetchedTodos);
          setTags(fetchedTags);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load todos');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredTodos = useMemo(() => {
    const today = getTodayStr();
    let result = todos;

    switch (filter) {
      case 'today':
        result = result.filter((t) => t.dueDate === today);
        break;
      case 'upcoming':
        result = result.filter((t) => !t.completed && t.dueDate != null && t.dueDate > today);
        break;
      case 'priority':
        result = result.filter(
          (t) => !t.completed && (t.priority === 'critical' || t.priority === 'high'),
        );
        break;
      case 'completed':
        result = result.filter((t) => t.completed);
        break;
      default:
        result = result.filter((t) => !t.completed);
    }

    if (selectedTagId) {
      result = result.filter((t) => t.tags.includes(selectedTagId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    return result;
  }, [todos, filter, selectedTagId, searchQuery]);

  const counts = useMemo<Record<FilterType, number>>(() => {
    const today = getTodayStr();
    return {
      all: todos.filter((t) => !t.completed).length,
      today: todos.filter((t) => t.dueDate === today && !t.completed).length,
      upcoming: todos.filter((t) => !t.completed && t.dueDate != null && t.dueDate > today)
        .length,
      priority: todos.filter(
        (t) => !t.completed && (t.priority === 'critical' || t.priority === 'high'),
      ).length,
      completed: todos.filter((t) => t.completed).length,
    };
  }, [todos]);

  const addTodo = async (
    title: string,
    options?: { priority?: PriorityLevel; dueDate?: string | null; tags?: string[] },
  ) => {
    const created = await api.post<Todo>('/todos', {
      title,
      priority: options?.priority ?? 'medium',
      tags: options?.tags ?? [],
      dueDate: options?.dueDate ?? null,
    });
    setTodos((prev) => [created, ...prev]);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
    try {
      await api.patch<Todo>(`/todos/${id}`, { completed: !todo.completed });
    } catch (err: unknown) {
      // Rollback
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const deleteTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    // Optimistic update
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.delete(`/todos/${id}`);
    } catch (err: unknown) {
      // Rollback
      setTodos((prev) => [todo, ...prev]);
      toast.error(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const addTag = async (data: { name: string; color: string }) => {
    const created = await api.post<Tag>('/tags', data);
    setTags((prev) => [...prev, created]);
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        filter,
        searchQuery,
        selectedTagId,
        tags,
        filteredTodos,
        counts,
        isLoading,
        setFilter,
        setSearchQuery,
        setSelectedTagId,
        addTodo,
        toggleTodo,
        deleteTodo,
        addTag,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be used within a TodoProvider');
  return context;
};
