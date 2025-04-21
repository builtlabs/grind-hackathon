import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="container flex w-full grow items-center justify-center py-20 xl:py-32">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Page not found!</CardTitle>
          <CardDescription>
            The page you are looking for does not exist. Please check the URL or return to the
            homepage.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full sm:ml-auto sm:w-44">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
