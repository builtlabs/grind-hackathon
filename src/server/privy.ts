import { type AuthTokenClaims, PrivyClient } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { env } from '@/env.mjs';

export const privy = new PrivyClient(env.NEXT_PUBLIC_PRIVY_APP_ID, env.PRIVY_APP_SECRET);

export const getPrivySession = cache(async (): Promise<AuthTokenClaims | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('privy-token')?.value;
  const sessionToken = cookieStore.get('privy-session')?.value;

  if (!accessToken || !sessionToken) {
    return null;
  }

  try {
    return privy.verifyAuthToken(accessToken);
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`);
    return null;
  }
});

export const getPrivyUser = cache(async () => {
  const cookieStore = await cookies();
  const idToken = cookieStore.get('privy-id-token')?.value;

  if (!idToken) {
    return null;
  }

  return privy.getUser({ idToken });
});
