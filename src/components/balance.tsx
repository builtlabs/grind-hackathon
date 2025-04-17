'use client';

import { useBalance } from 'wagmi';
import { Badge } from './ui/badge';
import { useGlobalWalletSignerAccount } from '@abstract-foundation/agw-react';

export const Balance: React.FC = () => {
  const { address } = useGlobalWalletSignerAccount();

  const balance = useBalance({
    address,
  });

  return (
    <Badge className="text-muted-foreground text-xs">
      {balance.isSuccess ? `${balance.data?.formatted} ${balance.data?.symbol}` : 'Loading...'}
    </Badge>
  );
};
