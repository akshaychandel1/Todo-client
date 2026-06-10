import { useState } from 'react';
import { Link } from 'react-router';
import { Menu } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SidebarContent } from './sidebar-content';
import { UserDropdownMenu } from './user-dropdown-menu';
import { SidebarFooter } from './sidebar-footer';

export function HeaderMobile() {
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);

  return (
    <header className="flex items-stretch fixed z-10 top-0 start-0 end-0 h-(--header-height-mobile) bg-zinc-100 dark:bg-zinc-900 pe-[var(--removed-body-scroll-bar-size,0px)]">
      <div className="flex items-stretch w-full bg-background border border-input rounded-xl shadow-xs m-2">
        <div className="container-fluid grow flex items-center justify-between gap-2.5">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div
              className="
                flex items-center p-[5.5px] gap-2
                rounded-[60px] border border-[rgba(255,255,255,0.3)]
                bg-linear-to-r from-primary to-blue-600
                dark:from-blue-950 dark:to-blue-800
                hover:opacity-90 dark:hover:opacity-85
                shadow-[0_0_0_1px_#000]
                transition-opacity
              "
            >
              <img src={toAbsoluteUrl('/media/app/logo-35.svg')} alt="logo" className="min-w-[16px]" />
            </div>
            <span className="text-mono text-sm font-medium">Todo App</span>
          </Link>

          <div className="flex items-center gap-2">
            <Sheet open={isSidebarSheetOpen} onOpenChange={setIsSidebarSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" mode="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                className="p-0 gap-0 w-(--sidebar-width-mobile)"
                side="left"
                close={false}
              >
                <SheetHeader className="p-0 space-y-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                </SheetHeader>
                <SheetBody className="flex flex-col grow p-0">
                  <SidebarContent />
                  <SidebarFooter />
                </SheetBody>
              </SheetContent>
            </Sheet>

            <UserDropdownMenu isCollapsed={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
