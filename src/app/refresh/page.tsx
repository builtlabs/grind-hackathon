'use client';

import { getAccessToken } from '@privy-io/react-auth';
import { type NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const Page: NextPage<PageProps> = (props: PageProps) => {
  const searchParams = use(props.searchParams);
  const callbackUrl = searchParams.callbackUrl as string | undefined;
  const router = useRouter();

  useEffect(() => {
    async function refresh(callbackUrl?: string) {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        router.replace(`/?callbackUrl=${encodeURIComponent(callbackUrl ?? '/')}`);
      } else {
        router.replace(callbackUrl ?? '/');
      }
    }

    refresh(callbackUrl).catch(console.error);
  }, [callbackUrl, router]);

  return null;
};

export default Page;
