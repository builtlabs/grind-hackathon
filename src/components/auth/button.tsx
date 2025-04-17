'use client';

import { CrossAppAccountWithMetadata, usePrivy } from '@privy-io/react-auth';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { AbstractLogin } from './abstract';
import { Address, Hex } from 'viem';
import { ABSTRACT_APP_ID } from '@/lib/abstract';

export function shorthandHex(hex?: Hex, length = 4): string {
  return hex ? `${hex.slice(0, length + 2)}...${hex.slice(-length)}` : '';
}

export const AuthButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { user, ready, logout } = usePrivy();

  if (!user) {
    return <AbstractLogin className={cn('w-44', className)} />;
  }

  const account = user.linkedAccounts.find(
    account => account.type === 'cross_app' && account.providerApp.id === ABSTRACT_APP_ID
  ) as CrossAppAccountWithMetadata;

  return (
    <Button
      className={cn('w-44', className)}
      type="button"
      variant="outline"
      disabled={!ready}
      onClick={logout}
    >
      {shorthandHex(account.embeddedWallets[0].address as Address)}
    </Button>
  );
};
