'use client';

import { PrivyProvider as PrivyProviderInternal, usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { env } from '@/env.mjs';
import { chains } from '@/lib/chain';
import { getCookie } from '@/lib/cookies';

const CookieHealth: React.FC = () => {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready || !authenticated) return;

    const accessToken = getCookie('privy-token');
    const sessionToken = getCookie('privy-session');

    if (!accessToken && sessionToken) {
      router.replace(`/refresh?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [ready, authenticated, pathname, router]);

  return null;
};

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderInternal
      config={{
        // @ts-expect-error - `chains` readonly
        supportedChains: chains,
      }}
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
      clientId={env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
    >
      <CookieHealth />
      {children}
    </PrivyProviderInternal>
  );
}
