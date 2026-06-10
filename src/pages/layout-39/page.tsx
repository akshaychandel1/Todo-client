import { useState } from 'react';
import { Plus, Trash2, Calendar, CheckCircle2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions,
} from '@/components/layouts/layout-39/components/toolbar';
import { ToolbarSearch } from '@/components/layouts/layout-39/components/toolbar-search';
import { NewTaskDialog } from '@/components/layouts/layout-39/components/new-task';
import {
  useTodos,
  type Todo,
  type FilterType,
  type PriorityLevel,
} from '@/components/layouts/layout-39/components/todo-context';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

function getTodayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return format(d, 'yyyy-MM-dd');
}

function parseDateStr(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDueDate(dateStr: string): string {
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return format(parseDateStr(dateStr), 'MMM d');
}

function isOverdue(dateStr: string | null, completed: boolean): boolean {
  if (!dateStr || completed) return false;
  return dateStr < getTodayStr();
}

// ─── priority config ─────────────────────────────────────────────────────────

type PriorityConfig = {
  label: string;
  dot: string;
  headerBg: string;
  headerText: string;
  badge: string;
};

const PRIORITY: Record<PriorityLevel, PriorityConfig> = {
  critical: {
    label: 'Critical',
    dot: '#ef4444',
    headerBg: 'bg-red-50 dark:bg-red-950/30',
    headerText: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
  },
  high: {
    label: 'High',
    dot: '#f97316',
    headerBg: 'bg-orange-50 dark:bg-orange-950/30',
    headerText: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  },
  medium: {
    label: 'Medium',
    dot: '#3b82f6',
    headerBg: 'bg-blue-50 dark:bg-blue-950/30',
    headerText: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  },
  low: {
    label: 'Low',
    dot: '#94a3b8',
    headerBg: 'bg-slate-50 dark:bg-slate-900/50',
    headerText: 'text-slate-500 dark:text-slate-400',
    badge: 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400',
  },
};

const PRIORITY_ORDER: PriorityLevel[] = ['critical', 'high', 'medium', 'low'];

// ─── task card ───────────────────────────────────────────────────────────────

function TaskCard({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo, tags } = useTodos();

  const getTag = (id: string) => tags.find((t) => t.id === id);
  const overdue = isOverdue(todo.dueDate, todo.completed);

  return (
    <div
      className={cn(
        'group p-3 rounded-lg border border-border bg-background hover:shadow-sm transition-all',
        todo.completed && 'opacity-55',
      )}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          size="sm"
          className="mt-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1.5">
          <p
            className={cn(
              'text-sm leading-snug break-words',
              todo.completed && 'line-through text-muted-foreground/60',
            )}
          >
            {todo.title}
          </p>
          {(todo.tags.length > 0 || todo.dueDate) && (
            <div className="flex items-center gap-2 flex-wrap">
              {todo.tags.map((tagId) => {
                const tag = getTag(tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-1 text-[0.65rem] text-muted-foreground"
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </span>
                );
              })}
              {todo.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-[0.65rem]',
                    overdue ? 'text-destructive font-medium' : 'text-muted-foreground',
                  )}
                >
                  <Calendar className="size-3 shrink-0" />
                  {formatDueDate(todo.dueDate)}
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          mode="icon"
          onClick={() => deleteTodo(todo.id)}
          className="size-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0 -mt-0.5 -me-0.5"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── priority column ─────────────────────────────────────────────────────────

function PriorityColumn({
  level,
  todos,
  onAddTask,
}: {
  level: PriorityLevel;
  todos: Todo[];
  onAddTask: () => void;
}) {
  const config = PRIORITY[level];

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 rounded-lg mb-3',
          config.headerBg,
        )}
      >
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: config.dot }}
        />
        <span className={cn('text-xs font-semibold', config.headerText)}>{config.label}</span>
        <span
          className={cn(
            'ms-auto text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full',
            config.badge,
          )}
        >
          {todos.length}
        </span>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-2 flex-1">
        {todos.map((todo) => (
          <TaskCard key={todo.id} todo={todo} />
        ))}

        {/* Add task inline trigger */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full text-left group"
        >
          <Plus className="size-3.5 opacity-50 group-hover:opacity-100" />
          Add task
        </button>
      </div>
    </div>
  );
}

// ─── filter metadata ─────────────────────────────────────────────────────────

const filterTitles: Record<FilterType, string> = {
  all: 'All Tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  priority: 'Priority',
  completed: 'Completed',
};

const filterDescriptions: Record<FilterType, string> = {
  all: 'All your active tasks',
  today: 'Tasks due today',
  upcoming: 'Tasks scheduled for the future',
  priority: 'Critical & high priority tasks',
  completed: 'Tasks you have finished',
};

// ─── page ────────────────────────────────────────────────────────────────────

export function Layout39Page() {
  const { filteredTodos, filter, counts, tags, selectedTagId, setSelectedTagId, isLoading } = useTodos();
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState<PriorityLevel>('medium');

  const selectedTag = selectedTagId ? tags.find((t) => t.id === selectedTagId) : null;

  const openNewTask = (priority: PriorityLevel = 'medium') => {
    setDefaultPriority(priority);
    setNewTaskOpen(true);
  };

  const byPriority = (level: PriorityLevel) =>
    filteredTodos.filter((t) => t.priority === level);

  const totalCount = counts[filter];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 flex flex-col h-full">
      <ToolbarSearch />

      <Toolbar>
        <ToolbarHeading>
          <div className="flex items-center gap-2 flex-wrap">
            <ToolbarPageTitle>{filterTitles[filter]}</ToolbarPageTitle>
            {selectedTag && (
              <button
                onClick={() => setSelectedTagId(null)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] border border-border bg-muted hover:bg-muted/80 transition-colors"
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedTag.color }}
                />
                {selectedTag.name}
                <X className="size-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <ToolbarDescription>
            {filterDescriptions[filter]} · {totalCount} task{totalCount !== 1 ? 's' : ''}
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="mono" onClick={() => openNewTask()}>
            <Plus />
            New Task
          </Button>
        </ToolbarActions>
      </Toolbar>

      {filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-muted-foreground">
          <CheckCircle2 className="size-12 mb-4 opacity-15" />
          <p className="text-sm font-medium">No tasks here</p>
          <p className="text-xs mt-1 opacity-70">
            {filter === 'completed'
              ? 'Complete a task to see it here'
              : 'Add a task to get started'}
          </p>
          {filter !== 'completed' && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => openNewTask()}
            >
              <Plus className="size-4" />
              Add Task
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-2">
          <div className="px-2 pb-4">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {PRIORITY_ORDER.map((level) => (
                <PriorityColumn
                  key={level}
                  level={level}
                  todos={byPriority(level)}
                  onAddTask={() => openNewTask(level)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      )}

      <NewTaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        defaultPriority={defaultPriority}
      />
    </div>
  );
}
