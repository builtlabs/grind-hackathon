import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="container flex w-full grow items-center justify-center">
      <div className="border-border bg-card container grid w-full max-w-3xl gap-6 rounded border p-4">
        <div className="flex flex-col">
          <h2>Page not found!</h2>
          <p className="text-muted-foreground">
            The page you are looking for does not exist. Please check the URL or return to the
            homepage.
          </p>
        </div>
        <Button asChild className="w-full sm:ml-auto sm:w-44">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </main>
  );
}
