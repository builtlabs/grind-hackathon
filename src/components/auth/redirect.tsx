'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RedirectOnLoginProps {
  callbackUrl?: string;
}

export const RedirectOnLogin: React.FC<RedirectOnLoginProps> = ({ callbackUrl }) => {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace(callbackUrl ?? '/');
    }
  }, [ready, authenticated, router, callbackUrl]);

  return null;
};
