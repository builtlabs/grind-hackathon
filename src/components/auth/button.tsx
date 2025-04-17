'use client';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Hex } from 'viem';
import { useGlobalWalletSignerAccount, useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useDisconnect } from 'wagmi';

export function shorthandHex(hex?: Hex, length = 4): string {
  return hex ? `${hex.slice(0, length + 2)}...${hex.slice(-length)}` : '';
}

export const AuthButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { address, status } = useGlobalWalletSignerAccount();
  const { disconnect: logout } = useDisconnect();
  const { login } = useLoginWithAbstract();

  if (status !== 'connected') {
    return (
      <Button className={cn('w-44', className)} onClick={login} type="button">
        Connect Abstract
      </Button>
    );
  }

  function handleLogout() {
    logout();
  }

  return (
    <Button
      className={cn('w-44', className)}
      type="button"
      variant="outline"
      onClick={handleLogout}
    >
      {shorthandHex(address)}
    </Button>
  );
};
