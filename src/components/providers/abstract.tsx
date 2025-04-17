'use client';

import { getQueryClient } from '@/lib/query-client';
import { transports } from '@/lib/viem';
import { AbstractWalletProvider } from '@abstract-foundation/agw-react';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { PropsWithChildren } from 'react';
import { abstractTestnet } from 'viem/chains';

const queryClient = getQueryClient();

type AbstractWalletWrapperProps = PropsWithChildren<{
  nonce?: string;
}>;

export const AbstractWalletWrapper: React.FC<AbstractWalletWrapperProps> = ({
  children,
  nonce,
}) => (
  <AbstractWalletProvider transport={transports[abstractTestnet.id]} chain={abstractTestnet}>
    <ReactQueryStreamedHydration queryClient={queryClient} nonce={nonce}>
      {children}
    </ReactQueryStreamedHydration>
  </AbstractWalletProvider>
);
