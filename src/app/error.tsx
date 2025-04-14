'use client'; // Error components must be Client Components

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { reset: resetReactQuery } = useQueryErrorResetBoundary();

  function resetBoundary() {
    reset();
    resetReactQuery();
  }

  return (
    <main className="container flex w-full grow items-center justify-center">
      <div className="border-border bg-card container grid w-full max-w-3xl gap-6 rounded border p-4">
        <div className="flex flex-col">
          <h2>Something went wrong!</h2>
          <p className="text-muted-foreground">
            An error occurred. Please try again later or contact support if the problem persists.
          </p>
        </div>
        <div className="border-borer rounded border p-4">
          <h3>Error details:</h3>
          <pre className="whitespace-normal">Name: {error.name}</pre>
          <pre className="whitespace-normal">Cause: {error.cause?.toString()}</pre>
          <pre className="whitespace-normal">Message: {error.message}</pre>
          <pre className="whitespace-normal">Digest: {error.digest}</pre>
        </div>
        <Button className="w-full sm:ml-auto sm:w-44" onClick={resetBoundary}>
          Try again
        </Button>
      </div>
    </main>
  );
}
