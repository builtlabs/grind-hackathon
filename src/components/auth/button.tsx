'use client';

import { Button } from '../ui/button';
import { cn, shorthandHex } from '@/lib/utils';
import {
  useAbstractClient,
  useGlobalWalletSignerAccount,
  useLoginWithAbstract,
} from '@abstract-foundation/agw-react';
import { useDisconnect } from 'wagmi';

export const AuthButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { status } = useGlobalWalletSignerAccount();
  const { data: client } = useAbstractClient();
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
      {shorthandHex(client?.account.address)}
    </Button>
  );
};
