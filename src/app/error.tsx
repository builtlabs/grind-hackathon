'use client'; // Error components must be Client Components

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
    <main className="container flex w-full grow items-center justify-center py-20 xl:py-32">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            An error occurred. Please try again later or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3>Error details:</h3>
          <pre className="whitespace-normal">Name: {error.name}</pre>
          <pre className="whitespace-normal">Cause: {error.cause?.toString()}</pre>
          <pre className="whitespace-normal">Message: {error.message}</pre>
          <pre className="whitespace-normal">Digest: {error.digest}</pre>
        </CardContent>
        <CardFooter>
          <Button className="w-full sm:ml-auto sm:w-44" onClick={resetBoundary}>
            Try again
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
