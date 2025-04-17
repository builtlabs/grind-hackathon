'use client';

import { ABSTRACT_APP_ID } from '@/lib/abstract';
import { CrossAppAccountWithMetadata, usePrivy } from '@privy-io/react-auth';
import { Address } from 'viem';
import { useBalance } from 'wagmi';
import { Badge } from './ui/badge';

export const Balance: React.FC = () => {
  const { user } = usePrivy();

  const account = user?.linkedAccounts.find(
    account => account.type === 'cross_app' && account.providerApp.id === ABSTRACT_APP_ID
  ) as CrossAppAccountWithMetadata | undefined;

  const balance = useBalance({
    address: account?.embeddedWallets[0].address as Address,
  });

  return (
    <Badge className="text-muted-foreground text-xs">
      {balance.isSuccess ? `${balance.data?.formatted} ${balance.data?.symbol}` : 'Loading...'}
    </Badge>
  );
};
