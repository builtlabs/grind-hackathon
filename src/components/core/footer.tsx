import Image from 'next/image';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-border bg-background/70 w-full border-t">
      <div className="container mx-auto my-12 flex flex-col items-center justify-between gap-10 px-10 sm:flex-row">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-1 text-xl font-bold uppercase sm:justify-start"
          >
            <Image
              src="/icon.png"
              alt="Icon"
              width={1024}
              height={1024}
              className="size-8 rounded-full"
            />
            HASHCRASH
          </Link>
          <span className="text-muted-foreground text-xs">
            made with ❤ by{' '}
            <Link
              href="https://x.com/BuiltLabs"
              className="hover:underline"
              rel="noopener noreferrer"
              target="_blank"
              aria-label="Twitter"
            >
              Built Labs
            </Link>
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="https://x.com/BuiltLabs"
            className="transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Twitter"
          >
            <Image
              src="https://cdn.simpleicons.org/x/black/white"
              className="size-4 stroke-current"
              alt="Twitter"
              width={24}
              height={24}
              unoptimized
            />
          </Link>
          <Link
            href="https://github.com/builtlabs/grind-hackathon"
            className="transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Website GitHub"
          >
            <Image
              src="https://cdn.simpleicons.org/github/black/white"
              className="size-4 stroke-current"
              alt="GitHub"
              width={24}
              height={24}
              unoptimized
            />
          </Link>
          <Link
            href="https://github.com/builtlabs/grind-hackathon-contracts"
            className="transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Solidity Contracts GitHub"
          >
            <Image
              src="https://cdn.simpleicons.org/solidity/black/white"
              className="size-4 stroke-current"
              alt="GitHub"
              width={24}
              height={24}
              unoptimized
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};
