import Image from 'next/image';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-border bg-background/70 w-full border-t">
      <div className="container mx-auto my-12 flex flex-col items-center justify-between gap-10 px-10 sm:flex-row sm:items-start">
        <div className="flex flex-col items-start gap-5">
          <Link href="/" className="text-xl font-bold uppercase">
            $GRIND HACKATHON
          </Link>
          <div className="flex items-center justify-start gap-2">
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
          </div>
        </div>
        <div className="flex items-end gap-5 whitespace-nowrap sm:flex-col">
          <Link
            href="https://x.com/BuiltLabs"
            className="transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Built Labs Twitter"
          >
            BUILT LABS
          </Link>
        </div>
      </div>
    </footer>
  );
};
