'use client';

import { useBalance } from 'wagmi';
import { Badge } from './ui/badge';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { formatUnits } from 'viem';

export const Balance: React.FC = () => {
  const { data: client } = useAbstractClient();

  const balance = useBalance({
    address: client?.account?.address,
    query: {
      select: data => ({
        formatted: formatUnits(data.value, data.decimals),
        symbol: data.symbol,
      }),
    },
  });

  if (!client) return null;

  return (
    <Badge className="text-muted-foreground text-xs">
      {balance.isSuccess ? `${balance.data?.formatted} ${balance.data?.symbol}` : 'Loading...'}
    </Badge>
  );
};
