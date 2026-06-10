import { Input, InputWrapper } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTodos } from './todo-context';

export function ToolbarSearch() {
  const { setSearchQuery } = useTodos();

  return (
    <div className="flex shrink-0 w-full">
      <InputWrapper>
        <Input
          type="search"
          placeholder="Search tasks..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Badge variant="outline" className="whitespace-nowrap" size="sm">
          ⌘ K
        </Badge>
      </InputWrapper>
    </div>
  );
}
