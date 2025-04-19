import { abstractTestnet } from 'viem/chains';
import { Button } from './ui/button';
import { Zap } from 'lucide-react';
import { useAbstractSession } from '@/hooks/use-abstract-session';
import { useEffect, useState } from 'react';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { toast } from 'sonner';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { encodeFunctionData, maxUint256 } from 'viem';
import { abi as grindAbi, addresses as grindAddresses } from '@/contracts/grind';
import { addresses } from '@/contracts/block-crash';
import { useGrindBalance } from '@/hooks/use-grind-balance';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Turbo: React.FC = () => {
  const { data: client } = useAbstractClient();
  const { getStoredSession, clearStoredSession, createAndStoreSession } =
    useAbstractSession(abstractTestnet);
  const [session, setSession] = useState<Awaited<ReturnType<typeof getStoredSession>>>(null);
  const grind = useGrindBalance();
  const { sendTransaction } = useSendTransaction({
    key: 'approve-grind',
    onSuccess() {
      grind.refetch();
      enableTurboMode();
    },
  });

  function enableTurboMode() {
    const promise = createAndStoreSession()?.then(session => {
      if (session) {
        setSession(session);
      }
    });

    if (promise) {
      toast.promise(promise, {
        loading: 'Enabling turbo mode...',
        success: 'Turbo mode enabled',
        error: 'Failed to enable turbo mode',
      });
    } else {
      toast.error('Failed to enable turbo mode');
    }
  }

  function handleTurboMode() {
    if (!client) return;

    if (session) {
      clearStoredSession();
      toast.success('Turbo mode disabled');
      setSession(null);
      sendTransaction({
        to: grindAddresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi: grindAbi,
          functionName: 'approve',
          args: [addresses[abstractTestnet.id], 0n],
        }),
      });
    } else {
      if (grind.data?.allowance === maxUint256) {
        enableTurboMode();
        return;
      } else {
        sendTransaction({
          to: grindAddresses[abstractTestnet.id],
          data: encodeFunctionData({
            abi: grindAbi,
            functionName: 'approve',
            args: [addresses[abstractTestnet.id], maxUint256],
          }),
        });
      }
    }
  }

  useEffect(() => {
    if (client && !session) {
      getStoredSession()?.then(session => {
        setSession(session);
      });
    }
  }, [client, getStoredSession, session]);

  if (!client) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="link"
            type="button"
            className="text-muted-foreground mt-1 ml-auto h-min text-xs"
            size="sm"
            onClick={handleTurboMode}
          >
            <Zap />
            {session ? 'disable turbo mode' : 'enable turbo mode'}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-64" side="bottom">
          <p>
            Turbo mode uses session keys to send transactions without confirmation, allowing you to
            place bets and cash out quicker!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
