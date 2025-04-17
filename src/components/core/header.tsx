import Link from 'next/link';
import { AuthButton } from '../auth/button';
import { Balance } from '../balance';

export const Header: React.FC = () => {
  return (
    <header className="border-border bg-background/70 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b px-5 shadow-lg drop-shadow-md backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold uppercase min-[320px]:text-3xl">
          RED BLOCK GREEN BLOCK
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Balance />
        <AuthButton />
      </div>
    </header>
  );
};
