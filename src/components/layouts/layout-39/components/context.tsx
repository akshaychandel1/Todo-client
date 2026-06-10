import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TooltipProvider } from '@/components/ui/tooltip';

interface LayoutState {
  style: React.CSSProperties;
  bodyClassName: string;
  isMobile: boolean;
  isSidebarOpen: boolean;
  sidebarToggle: () => void;
}

const LayoutContext = createContext<LayoutState | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
  style?: React.CSSProperties;
  bodyClassName?: string;
}

export function LayoutProvider({ children, style: customStyle, bodyClassName = '' }: LayoutProviderProps) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const defaultStyle = useMemo(
    () => ({
      '--sidebar-width': '250px',
      '--sidebar-width-mobile': '225px',
      '--sidebar-width-collapsed': '60px',
      '--header-height': '60px',
      '--header-height-mobile': '70px',
    }),
    [],
  );

  const style: React.CSSProperties = useMemo(
    () => ({ ...defaultStyle, ...customStyle }),
    [defaultStyle, customStyle],
  );

  const sidebarToggle = () => setIsSidebarOpen((open) => !open);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const originalHtmlStyle = html.style.cssText;
    const originalBodyClasses = body.className;

    Object.entries(style).forEach(([property, value]) => {
      if (typeof value === 'string' && property.startsWith('--')) {
        html.style.setProperty(property, value);
      }
    });

    if (bodyClassName) {
      body.className = `${originalBodyClasses} ${bodyClassName}`.trim();
    }

    body.setAttribute('data-sidebar-open', isSidebarOpen.toString());

    return () => {
      html.style.cssText = originalHtmlStyle;
      body.className = originalBodyClasses;
      body.removeAttribute('data-sidebar-open');
    };
  }, [style, bodyClassName, isSidebarOpen]);

  return (
    <LayoutContext.Provider value={{ bodyClassName, style, isMobile, isSidebarOpen, sidebarToggle }}>
      <div data-slot="layout-wrapper" className="flex grow">
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </div>
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayout must be used within a LayoutProvider');
  return context;
};
