import Link from 'next/link';
import { AbstractLogin } from '@/components/auth/abstract';
import { RedirectOnLogin } from '@/components/auth/redirect';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const callbackUrl = typeof searchParams.callbackUrl === 'string' ? searchParams.callbackUrl : '/';

  return (
    <main className="container flex w-full grow items-center justify-center">
      <RedirectOnLogin callbackUrl={callbackUrl} />

      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex items-center justify-center text-3xl font-semibold"></div>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Continue with your abstract account to access the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AbstractLogin className="w-full text-xs font-medium md:text-base" />
          </CardContent>
          <CardFooter className="border-border text-muted-foreground my-1 border-t border-dashed text-xs">
            <p>
              By continuing, you agree with our{' '}
              <Link href="/legal/terms-of-service" className="underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy-policy" className="underline">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
