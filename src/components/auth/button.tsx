'use client';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useGlobalWalletSignerAccount, useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { Account } from './account';

export const AuthButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { status } = useGlobalWalletSignerAccount();
  const { login } = useLoginWithAbstract();

  if (status !== 'connected') {
    return (
      <Button className={cn('md:w-44', className)} onClick={login} type="button">
        Connect Abstract
      </Button>
    );
  }

  return <Account className={className} />;
};
