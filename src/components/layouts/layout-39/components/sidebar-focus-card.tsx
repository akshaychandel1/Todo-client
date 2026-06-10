import { Progress } from '@/components/ui/progress';
import { useTodos } from './todo-context';

export function SidebarFocusCard() {
  const { counts } = useTodos();

  const total = counts.all + counts.completed;
  const completed = counts.completed;
  const value = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-input bg-muted/40 p-3 w-full min-w-full overflow-hidden truncate">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Overall progress</span>
        <span>
          {completed} / {total}
        </span>
      </div>
      <Progress value={value} indicatorClassName="bg-blue-500" className="h-2" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {value}% complete
        </p>
        <p className="text-xs text-muted-foreground">
          {counts.all} active · {counts.priority} priority
        </p>
      </div>
    </div>
  );
}
