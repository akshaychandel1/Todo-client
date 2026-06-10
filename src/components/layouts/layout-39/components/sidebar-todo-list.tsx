import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { CalendarCheck, ListTodo, Clock3, Flag, CheckCircle2 } from 'lucide-react';
import {
  AccordionMenu,
  AccordionMenuIndicator,
  AccordionMenuSub,
  AccordionMenuSubTrigger,
  AccordionMenuSubContent,
  AccordionMenuItem,
} from '@/components/ui/accordion-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTodos, type FilterType } from './todo-context';

interface SidebarTodoListProps {
  isCollapsed: boolean;
}

type TodoListConfig = {
  id: FilterType;
  title: string;
  icon: LucideIcon;
  badge: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
};

const todoListConfig: TodoListConfig[] = [
  { id: 'all', title: 'All Tasks', icon: ListTodo, badge: 'primary' },
  { id: 'today', title: 'Today', icon: CalendarCheck, badge: 'success' },
  { id: 'upcoming', title: 'Upcoming', icon: Clock3, badge: 'warning' },
  { id: 'priority', title: 'Priority', icon: Flag, badge: 'destructive' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, badge: 'info' },
];

export function SidebarTodoList({ isCollapsed }: SidebarTodoListProps) {
  const { filter, setFilter, counts } = useTodos();

  const todoLists = todoListConfig.map((item) => ({ ...item, count: counts[item.id] }));

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-1">
        {todoLists.map((todoList) => (
          <Tooltip key={todoList.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8.5 w-8.5',
                  filter === todoList.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
                onClick={() => setFilter(todoList.id)}
              >
                <todoList.icon
                  className={cn(
                    'size-4 transition-transform duration-200 hover:scale-110 hover:text-primary',
                    filter === todoList.id ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex items-center gap-2">
                <span>{todoList.title}</span>
                <Badge appearance="outline" variant={todoList.badge} size="sm">
                  {todoList.count}
                </Badge>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <AccordionMenu
      type="single"
      collapsible
      defaultValue="todoLists-trigger"
      selectedValue="todoLists-trigger"
      className="space-y-7.5"
      classNames={{
        item: 'h-8.5 px-2.5 text-sm font-normal text-foreground hover:text-primary data-[selected=true]:bg-muted data-[selected=true]:text-foreground [&[data-selected=true]_svg]:opacity-100 my-0.5',
        subTrigger: 'text-xs font-normal text-muted-foreground hover:bg-transparent',
        subContent: 'ps-0',
      }}
    >
      <AccordionMenuSub value="todoLists">
        <AccordionMenuSubTrigger value="todoLists-trigger">
          <span>My Lists</span>
          <AccordionMenuIndicator />
        </AccordionMenuSubTrigger>
        <AccordionMenuSubContent type="single" collapsible parentValue="todoLists-trigger">
          {todoLists.map((todoList) => (
            <AccordionMenuItem
              key={todoList.id}
              value={`todoList-${todoList.id}`}
              onClick={() => setFilter(todoList.id)}
            >
              <div
                className={cn(
                  'group flex w-full items-center gap-2 cursor-pointer',
                  filter === todoList.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <todoList.icon
                  className={cn(
                    'size-4 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary',
                    filter === todoList.id ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                {todoList.title}
                <Badge
                  appearance="outline"
                  variant={todoList.badge}
                  size="sm"
                  className="ms-auto"
                >
                  {todoList.count}
                </Badge>
              </div>
            </AccordionMenuItem>
          ))}
        </AccordionMenuSubContent>
      </AccordionMenuSub>
    </AccordionMenu>
  );
}
