'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AuthButton } from './auth/button';
import { Button } from './ui/button';
import { Zap } from 'lucide-react';
import { useAbstractClient, useGlobalWalletSignerAccount } from '@abstract-foundation/agw-react';
import { encodeFunctionData } from 'viem';
import { useGrindBalance } from '@/hooks/use-grind-balance';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { abi, addresses } from '@/contracts/grind';
import { abstractTestnet } from 'viem/chains';
import { useTurboMode } from '@/hooks/use-turbo-mode';
import Image from 'next/image';
import { useLocalStorage } from '@/hooks/use-local-storage';

type Device = 'ios-mobile' | 'ios-tablet' | 'android' | 'desktop' | 'chrome' | 'firefox' | 'edge';

function getInstruction(type?: Device) {
  switch (type) {
    case 'ios-mobile':
      return 'Tap the share button and select "Add to Home Screen".';
    case 'ios-tablet':
      return 'Tap the share button and select "Add to Home Screen".';
    case 'android':
      return 'Tap the three dots in the top right corner and select "Add to Home Screen".';
    case 'chrome':
      return 'Click the three dots in the top right corner and select "Save and share" then "Install page as app...".';
    case 'firefox':
      return 'Click the three lines in the top right corner and select "Install".';
    case 'edge':
      return 'Click the three dots in the top right corner and select "Apps" then "Install HashCrash".';
    default:
      return 'Use your browser settings to install this app.';
  }
}

function useDevice() {
  const [type, setType] = useState<Device>();

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOSMobile = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isTablet = /iPad/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent) && !/Edge|OPR/.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    const isEdge = /Edg/i.test(userAgent);

    if (isIOSMobile) {
      setType(isTablet ? 'ios-tablet' : 'ios-mobile');
    } else if (isAndroid) {
      setType('android');
    } else if (isEdge) {
      setType('edge');
    } else if (isChrome) {
      setType('chrome');
    } else if (isFirefox) {
      setType('firefox');
    } else {
      setType('desktop');
    }
  }, []);

  return type;
}

export const IntroDialog: React.FC = () => {
  const {
    value: seenIntro,
    setValue: setSeenIntro,
    isPending: seenIntroIsPending,
  } = useLocalStorage('builtlabs.hashcrash.intro', false);
  const { status } = useGlobalWalletSignerAccount();
  const { data: client } = useAbstractClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const type = useDevice();
  const [supportsPWA, setSupportsPWA] = useState(false);

  const grind = useGrindBalance({
    enabled: !!client?.account?.address && step === 3,
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
      if (step === 2) {
        setStep(3);
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
        grind.refetch();
        setStep(0);
        setOpen(false);
      },
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
    if (!seenIntroIsPending && !seenIntro) {
      setOpen(true);
      setSeenIntro(true);
    }
  }, [seenIntro, seenIntroIsPending, setSeenIntro]);

  useEffect(() => {
    if (client && step === 1) {
      setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && window.navigator.standalone);

    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent) && !/Edge|OPR/.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    const isEdge = /Edg/i.test(userAgent);

    const isSupportedBrowser = isChrome || isFirefox || isEdge || isIOS || isAndroid;

    if (isStandalone) {
      setSupportsPWA(false);
      if (step === 0) {
        setStep(1);
      }
    } else if (isSupportedBrowser) {
      setSupportsPWA(true);
    } else {
      setSupportsPWA(false);
      if (step === 0) {
        setStep(1);
      }
    }
  }, [step]);

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
          </div>
          <AlertDialogDescription className="text-start text-xs">
            This is a simple guide to help you get started with HashCrash. You can skip this guide
            at any time, and you can always come back to it later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex w-full items-center gap-2">
          {supportsPWA && (
            <Stage
              current={step}
              number={0}
              index={0}
              label="Install"
              onClick={() => {
                setStep(0);
              }}
            />
          )}
          <Stage
            current={step}
            number={1}
            index={supportsPWA ? 1 : 0}
            label="Account"
            onClick={() => {
              setStep(1);
            }}
          />
          <Stage
            current={step}
            number={2}
            index={supportsPWA ? 2 : 1}
            label="Turbo"
            onClick={() => {
              setStep(2);
            }}
            disabled={status !== 'connected'}
          />
          <Stage
            current={step}
            number={3}
            index={supportsPWA ? 3 : 2}
            label="Betting"
            onClick={() => {
              setStep(3);
            }}
            disabled={status !== 'connected'}
          />
        </div>

        <div className="scrollbar-hidden @container w-full overflow-x-hidden overflow-y-auto sm:h-72">
          <div
            className="flex h-full gap-10 transition-transform duration-500"
            style={{
              translate: `calc(${-step * 100}cqw + ${-step * 2.5}rem)`,
            }}
          >
            {/* STEP 0 */}
            <div className="flex w-[100cqw] flex-none flex-col">
              <h2 className="text-lg font-bold">Install App</h2>
              <p className="text-xs">
                HashCrash can be installed as a Progressive Web App (PWA) on your device. This
                allows you to play HashCrash without having to open your browser.
                <br />
                <br />
                {type && getInstruction(type)}
              </p>

              <AlertDialogFooter className="mt-auto">
                <Button className="md:w-44" variant="outline" onClick={() => setStep(1)}>
                  Skip Install
                </Button>
              </AlertDialogFooter>
            </div>

            {/* STEP 1 */}
            <div className="flex w-[100cqw] flex-none flex-col">
              <h2 className="text-lg font-bold">Abstract Global Wallet</h2>
              <p className="text-xs">
                HashCrash is a decentralized game that runs on the Abstract blockchain. To play
                connect your abstract global wallet.
              </p>

              <AlertDialogFooter className="mt-auto">
                <AuthButton authOnly />
                {status === 'connected' && (
                  <Button className="md:w-44" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                )}
              </AlertDialogFooter>
            </div>

            {/* STEP 2 */}
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
                {!session ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setStep(3)}
                      disabled={sessionKeyIsPending}
                      className="md:w-44"
                    >
                      Skip Turbo
                    </Button>
                    <Button
                      className="md:w-44"
                      onClick={handleTurboMode}
                      disabled={sessionKeyIsPending}
                    >
                      <Zap />
                      Enable Turbo
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="md:w-44"
                      onClick={handleTurboMode}
                      disabled={sessionKeyIsPending}
                    >
                      <Zap className="fill-current" />
                      Disable Turbo
                    </Button>
                    <Button
                      className="md:w-44"
                      onClick={() => setStep(3)}
                      disabled={sessionKeyIsPending}
                    >
                      Continue
                    </Button>
                  </>
                )}
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
                <span>Balance: {grind.isSuccess ? grind.data?.rounded : '0.00'} GRIND</span>
                <br />
                <br />
              </p>

              <AlertDialogFooter className="mt-auto">
                {grind.isSuccess && grind.data.raw > 0 && (
                  <Button
                    variant="outline"
                    className="md:w-44"
                    onClick={() => {
                      setStep(0);
                      setOpen(false);
                    }}
                  >
                    Skip Mint
                  </Button>
                )}
                <Button className="md:w-44" onClick={handleMint} disabled={isPending}>
                  Mint $GRIND
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
  index: number;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ current, number, index, label, onClick, disabled }) => {
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
          <span className="text-foreground">{index + 1}</span>
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
