import { Helmet } from 'react-helmet-async';
import { Wrapper } from './components/wrapper';
import { LayoutProvider } from './components/context';
import { TodoProvider } from './components/todo-context';

export function Layout39() {
  return (
    <>
      <Helmet>
        <title>KeenTodo</title>
      </Helmet>

      <LayoutProvider
        bodyClassName="bg-zinc-100 dark:bg-zinc-900 lg:overflow-hidden"
        style={{
          '--sidebar-width': '250px',
          '--sidebar-width-mobile': '225px',
          '--sidebar-width-collapsed': '60px',
          '--header-height': '60px',
          '--header-height-mobile': '70px',
        } as React.CSSProperties}
      >
        <TodoProvider>
          <Wrapper />
        </TodoProvider>
      </LayoutProvider>
    </>
  );
}
