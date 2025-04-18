import Link from 'next/link';
import { AuthButton } from '../auth/button';
import Image from 'next/image';

export const Header: React.FC = () => {
  return (
    <header className="border-border bg-background/70 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b px-5 shadow-lg drop-shadow-md backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-bold uppercase min-[320px]:text-2xl min-[400px]:text-3xl"
        >
          <Image
            src="/icon.png"
            alt="Icon"
            width={1024}
            height={1024}
            className="size-10 rounded-full"
          />
          HASHCRASH
        </Link>
      </div>

      <AuthButton />
    </header>
  );
};
