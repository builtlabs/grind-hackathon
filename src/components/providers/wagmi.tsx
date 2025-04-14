'use client';

import type { ReactNode } from 'react';
import React from 'react';
import type { State } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';

function ContextProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

export { ContextProvider as WagmiProvider };
