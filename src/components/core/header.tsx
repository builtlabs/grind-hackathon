import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeSwitch } from '../theme-switch';
import { MobileNavLink, NavLine, NavLink } from './nav-link';
import Image from 'next/image';
import { AuthButton } from '../auth/button';

const Links: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('flex items-center gap-2 md:gap-4', className)}>
      <Link
        href="https://github.com/"
        className="transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
        rel="noopener noreferrer"
        target="_blank"
        aria-label="GitHub"
      >
        <Image
          src="https://cdn.simpleicons.org/github/black/white"
          className="size-3 stroke-current md:size-4"
          alt="GitHub"
          width={24}
          height={24}
          unoptimized
        />
      </Link>
      <Link
        href="https://x.com/GrindTheCoin"
        className="transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
        rel="noopener noreferrer"
        target="_blank"
        aria-label="Twitter"
      >
        <Image
          src="https://cdn.simpleicons.org/x/black/white"
          className="size-3 stroke-current md:size-4"
          alt="Twitter"
          width={24}
          height={24}
          unoptimized
        />
      </Link>
      <Link
        href="https://grind.bearish.af/"
        download
        className="transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
        rel="noopener noreferrer"
        target="_blank"
        aria-label="$GRIND VIBECODE HACKATHON"
      >
        $Grind
      </Link>
      <ThemeSwitch className="size-8 rounded-sm xl:hidden" />
    </div>
  );
};

export const Header: React.FC = () => {
  return (
    <header className="border-border bg-background/70 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b px-5 shadow-lg drop-shadow-md backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger className="md:hidden">
            <Menu className="text-icon size-6 min-[320px]:size-8" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold uppercase min-[450px]:text-3xl">
                GRIND HACKATHON
              </SheetTitle>
            </SheetHeader>
            <div className="flex grow flex-col p-4">
              <MobileNavLink href="/">Home</MobileNavLink>

              <Links className="mt-auto ml-auto" />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="text-xl font-bold uppercase min-[320px]:text-3xl">
          $GRIND HACKATHON
        </Link>
      </div>

      <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-4 md:flex">
        <NavLink href="/">Home</NavLink>
        <NavLine />
      </nav>

      <AuthButton />
    </header>
  );
};
