'use client';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useGlobalWalletSignerAccount, useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { Account } from './account';
import { useDisconnect } from 'wagmi';

export const AuthButton: React.FC<{
  className?: string;
  authOnly?: boolean;
}> = ({ className, authOnly }) => {
  const { status } = useGlobalWalletSignerAccount();
  const { login } = useLoginWithAbstract();
  const { disconnect: logout } = useDisconnect();

  if (status !== 'connected') {
    return (
      <Button className={cn('md:w-44', className)} onClick={login} type="button">
        Connect <span className="hidden min-[420px]:inline">Abstract</span>
      </Button>
    );
  }

  if (authOnly) {
    function handleLogout() {
      logout();
    }

    return (
      <Button
        variant="outline"
        className={cn('md:w-44', className)}
        onClick={handleLogout}
        type="button"
      >
        Disconnect
      </Button>
    );
  }

  return <Account className={className} />;
};
