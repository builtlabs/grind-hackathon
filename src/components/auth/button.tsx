'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const AuthButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { ready, authenticated } = usePrivy();

  if (!authenticated) {
    return (
      <Button
        className={cn('w-44', className)}
        disabled={!ready || authenticated}
        type="button"
        asChild
      >
        <Link href="/signin">Sign In</Link>
      </Button>
    );
  }

  return (
    <Button
      className={cn('w-44', className)}
      disabled={!ready || authenticated}
      type="button"
      variant="outline"
      asChild
    >
      <Link href="/profile">Profile</Link>
    </Button>
  );
};
