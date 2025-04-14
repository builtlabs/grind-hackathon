import Link from 'next/link';
import { AbstractLogin } from '@/components/auth/abstract';
import { RedirectOnLogin } from '@/components/auth/redirect';

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
        <div className="flex items-center justify-center text-3xl font-semibold">
          Sign In.
        </div>
        <div className="flex w-full flex-col gap-3 rounded-xl bg-card px-6 py-9">
          <AbstractLogin className="text-xs font-medium md:text-base"/>
          <hr className="border-border my-1 border-t border-dashed" />
          <p className="text-muted-foreground text-center text-[10px]">
            By continuing, you agree with our{' '}
            <Link href="/legal/terms-of-service" className="underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy-policy" className="underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
