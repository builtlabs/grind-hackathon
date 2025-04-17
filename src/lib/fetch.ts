import { env } from '@/env.mjs';

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  let res;

  if (typeof window !== 'undefined') {
    res = await fetch(url, init);
  } else {
    const { cookies, headers } = await import('next/headers');
    const headersStore = await headers();
    const cookiesStore = await cookies();
    const host = headersStore.get('host');
    const origin = env.NODE_ENV === 'production' ? `https://${host}` : `http://${host}`;
    const urlObj = new URL(`${origin}${url}`);
    urlObj.searchParams.set('server', 'true');

    const finalHeaders = new Headers(init?.headers);
    finalHeaders.set('cookie', cookiesStore.toString());
    headersStore.forEach((value, key) => {
      if (!finalHeaders.has(key)) {
        finalHeaders.set(key, value);
      }
    });

    // Remove content-length header if it exists
    finalHeaders.delete('content-length');

    res = await fetch(urlObj.toString(), {
      ...init,
      headers: finalHeaders,
    });
  }

  if (!res.ok) {
    const error = (await res.json()) as string | { message: string };
    throw new Error(typeof error === 'string' ? error : error.message, {
      cause: res.status,
    });
  }

  return res.json() as Promise<T>;
}
