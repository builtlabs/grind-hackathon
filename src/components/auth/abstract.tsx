'use client';

import { useCrossAppAccounts, usePrivy } from '@privy-io/react-auth';
import { type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ABSTRACT_APP_ID } from '@/lib/abstract';

export const AbstractLogin: React.FC<Omit<ComponentProps<typeof Button>, 'children'>> = ({
  className,
  ...props
}) => {
  const { ready, authenticated } = usePrivy();
  const { loginWithCrossAppAccount } = useCrossAppAccounts();

  function handleLogin() {
    loginWithCrossAppAccount({ appId: ABSTRACT_APP_ID });
  }

  return (
    <Button
      className={cn('flex items-center gap-2.5', className)}
      onClick={handleLogin}
      disabled={!ready || authenticated}
      type="button"
      {...props}
    >
      Login with Abstract
    </Button>
  );
};
