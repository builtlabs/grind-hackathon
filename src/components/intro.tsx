'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useEffect, useState } from 'react';
import { cn, shorthandHex } from '@/lib/utils';
import { AuthButton } from './auth/button';
import { Button } from './ui/button';
import { ClipboardCopy, Zap } from 'lucide-react';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { toast } from 'sonner';
import { useBalance } from 'wagmi';
import { encodeFunctionData, formatUnits } from 'viem';
import Link from 'next/link';
import { useGrindBalance } from '@/hooks/use-grind-balance';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { abi, addresses } from '@/contracts/grind';
import { abstractTestnet } from 'viem/chains';
import { useTurboMode } from '@/hooks/use-turbo-mode';
import Image from 'next/image';

export const IntroDialog: React.FC = () => {
  const { data: client } = useAbstractClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const balance = useBalance({
    address: client?.account?.address,
    query: {
      select: data => ({
        formatted: Number(formatUnits(data.value, data.decimals)).toFixed(4),
        symbol: data.symbol,
        raw: data.value,
      }),
      refetchInterval: 10000,
      enabled: !!client?.account?.address && step === 1,
    },
  });
  const [balanceCountdown, setBalanceCountdown] = useState(0);

  const grind = useGrindBalance({
    enabled: !!client?.account?.address && step === 1,
  });

  const { sendTransaction, isPending } = useSendTransaction({
    key: 'mint-grind',
  });

  const {
    session,
    createSession,
    clearSession,
    isPending: sessionKeyIsPending,
  } = useTurboMode({
    enabled: true,
    onEnabled() {
      if (step === 3) {
        setStep(0);
        setOpen(false);
      }
    },
  });

  function handleMint() {
    sendTransaction({
      transaction: {
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'mint',
        }),
      },
      onSuccess() {
        setStep(3);
      },
    });
  }

  function handleCopy() {
    toast.promise(navigator.clipboard.writeText(client?.account.address ?? ''), {
      loading: 'Copying address...',
      success: 'Address copied to clipboard',
      error: 'Failed to copy address',
    });
  }

  function handleTurboMode() {
    if (session) {
      clearSession();
    } else {
      createSession();
    }
  }

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('builtlabs.hashcrash.intro') === 'true';
    if (!hasSeenIntro) {
      setOpen(true);
      localStorage.setItem('builtlabs.hashcrash.intro', 'true');
    }

    setOpen(true);
  }, []);

  useEffect(() => {
    if (client && step === 0) {
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  useEffect(() => {
    const targetTime = balance.dataUpdatedAt + 10000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingTime = targetTime - now;

      if (remainingTime <= 0) {
        setBalanceCountdown(0);
        clearInterval(interval);
      } else {
        setBalanceCountdown(Math.ceil(remainingTime / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [balance.dataUpdatedAt, balanceCountdown]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="flex max-h-[95vh] flex-col overflow-hidden">
        <AlertDialogHeader>
          <div className="flex w-full items-center justify-between">
            <AlertDialogTitle className="flex items-center gap-1">
              <Image
                src="/icon.png"
                alt="Icon"
                width={1024}
                height={1024}
                className="size-8 rounded-full"
              />
              HashCrash
            </AlertDialogTitle>

            <AlertDialogCancel>
              Skip <span className="hidden sm:inline-block">Tutorial</span>
            </AlertDialogCancel>
          </div>
          <AlertDialogDescription className="text-start text-xs">
            This is a simple guide to help you get started with HashCrash. You can skip this guide
            at any time, and you can always come back to it later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex w-full items-center gap-2">
          <Stage
            current={step}
            number={0}
            label="Account"
            onClick={() => {
              setStep(0);
            }}
          />
          <Stage
            current={step}
            number={1}
            label="Gas"
            onClick={() => {
              setStep(1);
            }}
            disabled={!client}
          />
          <Stage
            current={step}
            number={2}
            label="Betting"
            onClick={() => {
              setStep(2);
            }}
            disabled={!client || balance.isLoading || balance.isError || balance.data?.raw === 0n}
          />
          <Stage
            current={step}
            number={3}
            label="Turbo"
            onClick={() => {
              setStep(3);
            }}
            disabled={!client || grind.isLoading || grind.isError || grind.data?.raw === 0n}
          />
        </div>

        <div className="scrollbar-hidden @container w-full overflow-y-auto sm:h-72">
          <div
            className="flex h-full gap-10 transition-transform duration-500"
            style={{
              translate: `calc(${-step * 100}cqw + ${-step * 2.5}rem)`,
            }}
          >
            {/* STEP 1 */}
            <div className="flex w-[100cqw] flex-none flex-col">
              <h2 className="text-lg font-bold">Abstract Global Wallet</h2>
              <p className="text-xs">
                HashCrash is a decentralized game that runs on the Abstract blockchain. To play
                connect your abstract global wallet.
              </p>

              <AlertDialogFooter className="mt-auto">
                <AuthButton authOnly />
              </AlertDialogFooter>
            </div>

            {/* STEP 2 */}
            <div className="flex w-[100cqw] flex-none flex-col">
              <h2 className="text-lg font-bold">Gas fees</h2>
              <p className="text-xs">
                To play HashCrash, you need to have some ETH in your wallet. You can get some ETH
                from the Abstract testnet faucet; but we have found these to be unreliable.
                <br />
                <br />
                We recommend using an{' '}
                <Link
                  className="underline"
                  href="https://docs.abs.xyz/tooling/faucets#l1-sepolia-faucets"
                >
                  L1 Sepolia Faucet
                </Link>{' '}
                and then{' '}
                <Link
                  className="underline"
                  href="https://native-bridge.abs.xyz/bridge/?network=abstract-testnet"
                >
                  bridging
                </Link>{' '}
                the funds to your Abstract account.
                <br />
                <br />
                Address:{' '}
                <span className="select-none">{shorthandHex(client?.account.address)}</span>
                <br />
                <span>
                  Balance: {balance.isSuccess ? balance.data?.formatted : '0.00'} ETH (
                  {balanceCountdown}s)
                </span>
              </p>

              <AlertDialogFooter className="mt-auto">
                <Button onClick={handleCopy} variant="outline">
                  <ClipboardCopy />
                  <span>{shorthandHex(client?.account.address)}</span>
                </Button>
                <Button
                  onClick={() => {
                    setStep(2);
                  }}
                  disabled={balance.isSuccess && balance.data?.raw === 0n}
                >
                  {balance.isSuccess && balance.data?.raw > 0 ? 'Continue' : 'You need more ETH'}
                </Button>
              </AlertDialogFooter>
            </div>

            {/* STEP 3 */}
            <div className="flex w-[100cqw] flex-none flex-col">
              <h2 className="text-lg font-bold">How to place a bet</h2>
              <p className="text-xs">
                HashCrash is a simple game where you place a bet on the outcome of a crash. You can
                place a bet by selecting the amount you want to bet and the maximum multiplier you
                want to bet on; remember you can cash out at any time.
                <br />
                <br />
                To play HashCrash, you need to have some GRIND in your wallet. You can mint some
                GRIND from the contract.
                <br />
                <br />
                <span>Balance: {grind.isSuccess ? grind.data?.formatted : '0.00'} GRIND</span>
                <br />
                <br />
              </p>

              <AlertDialogFooter className="mt-auto">
                <Button onClick={handleMint} disabled={isPending}>
                  Mint $GRIND
                </Button>
              </AlertDialogFooter>
            </div>

            {/* STEP 4 */}
            <div className="flex w-[100cqw] flex-none flex-col">
              <h2 className="flex items-center gap-1 text-lg font-bold">
                <Zap className="size-5 fill-current" /> Turbo Mode
              </h2>
              <p className="text-xs">
                Turbo mode uses session keys to send transactions without confirmation, allowing you
                to place bets and cash out quicker!
                <br />
                <br />
                Turbo mode requires that you approve the game contract to spend your GRIND tokens.
                <br />
                <br />
                This is a one-time action, for the lifetime of your session key. You can disable
                turbo mode at any time.
                <br />
                <br />
                Whilst this is highly recommended, it is not required to play the game.
              </p>

              <AlertDialogFooter className="mt-auto">
                <AlertDialogCancel>Skip Turbo Mode</AlertDialogCancel>
                <Button onClick={handleTurboMode} disabled={sessionKeyIsPending}>
                  <Zap className={cn(session && 'fill-current')} />
                  {session ? 'disable turbo mode' : 'enable turbo mode'}
                </Button>
              </AlertDialogFooter>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const Stage: React.FC<{
  current: number;
  number: number;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ current, number, label, onClick, disabled }) => {
  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          'text-muted flex cursor-pointer items-center gap-1 transition-colors duration-500 disabled:cursor-default',
          current === number && 'text-[#3c57f0]',
          current > number && 'text-constructive/60'
        )}
        disabled={disabled}
      >
        <div className="flex size-6 flex-none items-center justify-center rounded-full bg-current p-1 text-xs font-bold">
          <span className="text-foreground">{number + 1}</span>
        </div>
        <span className="hidden text-xs text-current sm:inline-block">{label}</span>
      </button>
      <div
        className={cn(
          'bg-muted flex h-0.5 grow rounded-full transition-all duration-500 last:hidden',
          current === number && 'bg-[#3c57f0]',
          current > number && 'bg-constructive/60'
        )}
      />
    </>
  );
};
