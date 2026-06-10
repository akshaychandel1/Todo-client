import { useEffect, useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTodos, type PriorityLevel } from './todo-context';

function getTodayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return format(d, 'yyyy-MM-dd');
}

const PRIORITIES: { value: PriorityLevel; label: string; color: string; active: string }[] = [
  {
    value: 'critical',
    label: 'Critical',
    color: '#ef4444',
    active: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
  },
  {
    value: 'high',
    label: 'High',
    color: '#f97316',
    active: 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: '#3b82f6',
    active: 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
  },
  {
    value: 'low',
    label: 'Low',
    color: '#94a3b8',
    active: 'border-slate-400 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-600',
  },
];

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPriority?: PriorityLevel;
}

export function NewTaskDialog({ open, onOpenChange, defaultPriority = 'medium' }: NewTaskDialogProps) {
  const { addTodo, tags } = useTodos();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(defaultPriority);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  useEffect(() => {
    if (open) setPriority(defaultPriority);
  }, [open, defaultPriority]);

  const reset = () => {
    setTitle('');
    setPriority(defaultPriority);
    setDueDate(null);
    setSelectedTags([]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        await addTodo(title, { priority, dueDate, tags: selectedTags });
        reset();
        onOpenChange(false);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to add task');
      }
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const customDate =
    dueDate && dueDate !== todayStr && dueDate !== tomorrowStr ? dueDate : '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && title.trim()) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && title.trim()) handleSubmit();
            }}
          />

          {/* Priority */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Priority</p>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border text-xs font-medium transition-colors',
                    priority === p.value
                      ? p.active
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
                  )}
                >
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date quick select */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Due Date</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                type="button"
                variant={dueDate === null ? 'primary' : 'outline'}
                onClick={() => setDueDate(null)}
              >
                No Date
              </Button>
              <Button
                size="sm"
                type="button"
                variant={dueDate === todayStr ? 'primary' : 'outline'}
                onClick={() => setDueDate(todayStr)}
              >
                Today
              </Button>
              <Button
                size="sm"
                type="button"
                variant={dueDate === tomorrowStr ? 'primary' : 'outline'}
                onClick={() => setDueDate(tomorrowStr)}
              >
                Tomorrow
              </Button>
              <input
                type="date"
                value={customDate}
                min={todayStr}
                onChange={(e) => setDueDate(e.target.value || null)}
                className="h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors',
                      active
                        ? 'border-foreground/20 bg-foreground/10 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
                    )}
                  >
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!title.trim() || isPending} onClick={handleSubmit}>
            {isPending ? 'Adding…' : 'Add Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewTask({ isCollapsed }: { isCollapsed: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                'mx-auto w-full bg-linear-to-r from-primary to-blue-600 hover:opacity-90 dark:hover:opacity-85 text-white shadow-lg text-sm transition-opacity',
                'dark:from-blue-950 dark:to-blue-800',
              )}
              size="icon"
              onClick={() => setOpen(true)}
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New Task</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          className={cn(
            'mx-auto w-full bg-linear-to-r from-primary to-blue-600 hover:opacity-90 dark:hover:opacity-85 text-white shadow-lg text-sm transition-opacity',
            'dark:from-blue-950 dark:to-blue-800',
          )}
          size="md"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          <span className="font-semibold">New Task</span>
        </Button>
      )}
      <NewTaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
