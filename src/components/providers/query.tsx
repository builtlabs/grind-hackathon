'use client';

import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { getQueryClient } from '@/lib/query-client';

const queryClient = getQueryClient();

type QueryProviderProps = PropsWithChildren<{
  nonce?: string;
}>;

export const QueryProvider: React.FC<QueryProviderProps> = ({ children, nonce }) => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryStreamedHydration queryClient={queryClient} nonce={nonce}>
      {children}
    </ReactQueryStreamedHydration>
  </QueryClientProvider>
);
