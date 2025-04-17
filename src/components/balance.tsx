'use client';

import { useBalance } from 'wagmi';
import { Badge } from './ui/badge';
import { useAbstractClient } from '@abstract-foundation/agw-react';

export const Balance: React.FC = () => {
  const { data: client } = useAbstractClient();

  const balance = useBalance({
    address: client?.account?.address,
  });

  return (
    <Badge className="text-muted-foreground text-xs">
      {balance.isSuccess ? `${balance.data?.formatted} ${balance.data?.symbol}` : 'Loading...'}
    </Badge>
  );
};
