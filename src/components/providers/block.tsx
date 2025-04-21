'use client';

import { env } from '@/env.mjs';
import { Alchemy, Network } from 'alchemy-sdk';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const alchemy = new Alchemy({
  apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ABSTRACT_TESTNET,
});

interface BlockData {
  number?: number;
}

const BlockContext = createContext<BlockData | null>(null);

export const BlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [block, setBlock] = useState<number>();

  useEffect(() => {
    function handleBlock(block: number) {
      setBlock(block);
    }

    if (typeof window === 'undefined') return;

    alchemy.core
      .getBlockNumber()
      .then(block => setBlock(block))
      .catch(console.error);

    alchemy.ws.on('block', handleBlock);

    return () => {
      alchemy.ws.removeAllListeners();
    };
  }, []);

  const value: BlockData = useMemo(() => ({ number: block }), [block]);

  return <BlockContext.Provider value={value}>{children}</BlockContext.Provider>;
};

export function useBlock() {
  const context = useContext(BlockContext);
  if (context === null) {
    throw new Error('useBlock must be used within a BlockProvider');
  }
  return context;
}
