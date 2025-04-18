import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { useBalance, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { BlurredAvatar } from './avatar';
import { ClipboardCopy, Fuel, LifeBuoy, LogOut } from 'lucide-react';
import { shorthandHex } from '@/lib/utils';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import Link from 'next/link';

export const Account: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { disconnect: logout } = useDisconnect();
  const { data: client } = useAbstractClient();
  const { data: name } = useEnsName({
    address: client?.account.address,
  });
  const { data: avatar } = useEnsAvatar({ name: name ?? undefined });
  const balance = useBalance({
    address: client?.account?.address,
    query: {
      select: data => ({
        formatted: Number(formatUnits(data.value, data.decimals)).toFixed(4),
        symbol: data.symbol,
      }),
    },
  });

  function handleLogout() {
    logout();
  }

  function handleCopy() {
    toast.promise(navigator.clipboard.writeText(client?.account.address ?? ''), {
      loading: 'Copying address...',
      success: 'Address copied to clipboard',
      error: 'Failed to copy address',
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <Avatar className="size-8">
          {avatar ? <AvatarImage src={avatar} /> : null}
          {client ? (
            <AvatarFallback>
              <BlurredAvatar address={client?.account.address} size={32} />
            </AvatarFallback>
          ) : null}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Abstract Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="https://docs.abs.xyz/tooling/faucets#abstract-testnet-faucets"
            target="_blank"
            rel="noreferrer"
          >
            <Fuel />
            <span>
              {balance.isSuccess ? `${balance.data?.formatted} ${balance.data?.symbol}` : ''}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <ClipboardCopy />
          <span>{shorthandHex(client?.account.address)}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LifeBuoy />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
