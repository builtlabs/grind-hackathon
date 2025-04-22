import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { abi, addresses } from '@/contracts/block-crash';
import { abi as grindAbi, addresses as grindAddresses } from '@/contracts/grind';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { useEffect, useState } from 'react';
import {
  Account,
  Address,
  Chain,
  encodeFunctionData,
  formatUnits,
  isAddressEqual,
  parseUnits,
  SendTransactionParameters,
} from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useReadContracts } from 'wagmi';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { formatNumber } from '@/lib/utils';
import { useGame } from './providers/game';
import { useBlock } from './providers/block';
import { multipliers } from '@/lib/block-crash';
import { Wrench } from 'lucide-react';

export const ManageLiquidity: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { number } = useBlock();
  const { state, oldState } = useGame();
  const { data: client } = useAbstractClient();
  const { sendTransaction, isPending } = useSendTransaction({
    key: 'liquidity',
  });
  const [ended, setEnded] = useState(false);

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'getTotalShares',
      },
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'getShares',
        args: [client?.account.address as Address],
      },
      {
        address: addresses[abstractTestnet.id],
        abi,
        functionName: 'getLiquidityQueue',
      },
      {
        address: grindAddresses[abstractTestnet.id],
        abi: grindAbi,
        functionName: 'balanceOf',
        args: [addresses[abstractTestnet.id]],
      },
      {
        address: grindAddresses[abstractTestnet.id],
        abi: grindAbi,
        functionName: 'balanceOf',
        args: [client?.account.address as Address],
      },
      {
        address: grindAddresses[abstractTestnet.id],
        abi: grindAbi,
        functionName: 'decimals',
      },
      {
        address: grindAddresses[abstractTestnet.id],
        abi: grindAbi,
        functionName: 'symbol',
      },
      {
        address: grindAddresses[abstractTestnet.id],
        abi: grindAbi,
        functionName: 'allowance',
        args: [client?.account.address as Address, addresses[abstractTestnet.id]],
      },
    ],
    allowFailure: false,
    multicallAddress: abstractTestnet.contracts?.multicall3?.address,
    query: {
      refetchInterval: 0,
      enabled: open && Boolean(client),
      select([totalShares, shares, queue, contractBalance, balance, decimals, symbol, allowance]) {
        const myQueue = queue
          .filter(item => isAddressEqual(item.user, client!.account.address))
          .map(item => {
            if (item.action === 0) {
              // Deposit
              return {
                action: 'Deposit',
                tokens: {
                  raw: item.amount,
                  formatted: formatUnits(item.amount, decimals),
                  rounded: formatNumber(Number(formatUnits(item.amount, decimals))),
                  decimals,
                  symbol,
                },
              };
            } else {
              // Withdraw
              return {
                action: 'Withdraw',
                shares: {
                  raw: item.amount,
                  formatted: formatUnits(item.amount, 18),
                  rounded: formatNumber(Number(formatUnits(item.amount, decimals))),
                  decimals: 18,
                  symbol: 'SHARES',
                },
              };
            }
          });

        const myShares = myQueue.reduce((acc, item) => {
          if (item.action === 'Withdraw') {
            return acc - (item.shares?.raw ?? 0n);
          }

          return acc;
        }, shares);

        const myBalance = myQueue.reduce((acc, item) => {
          if (item.action === 'Deposit') {
            return acc - (item.tokens?.raw ?? 0n);
          }

          return acc;
        }, balance);

        return {
          shares: {
            raw: myShares,
            formatted: formatUnits(myShares, 18),
            rounded: formatNumber(Number(formatUnits(myShares, 18))),
            decimals: 18,
            symbol: 'SHARES',
          },
          totalShares: {
            raw: totalShares,
            formatted: formatUnits(totalShares, 18),
            rounded: formatNumber(Number(formatUnits(totalShares, 18))),
            decimals: 18,
            symbol: 'SHARES',
          },
          value: {
            raw: (shares * contractBalance) / totalShares,
            formatted: formatUnits((shares * contractBalance) / totalShares, decimals),
            rounded: formatNumber(
              Number(formatUnits((shares * contractBalance) / totalShares, decimals))
            ),
            decimals,
            symbol,
          },
          balance: {
            raw: myBalance,
            formatted: formatUnits(myBalance, decimals),
            rounded: formatNumber(Number(formatUnits(myBalance, decimals))),
            decimals,
            symbol,
          },
          allowance: {
            raw: allowance,
            formatted: formatUnits(allowance, decimals),
            rounded: formatNumber(Number(formatUnits(allowance, decimals))),
            decimals,
            symbol,
          },
          queue: myQueue,
        };
      },
    },
  });

  function handleDeposit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client) {
      toast.error('Not connected', {
        description: `Please connect abstract before placing a bet.`,
      });
      return;
    }

    if (!data) return;

    const formData = new FormData(event.currentTarget);
    const amount = formData.get('amount') as string;

    if (!amount) {
      toast.error('Invalid Deposit', {
        description: `Please enter a valid amount.`,
      });
      return;
    }

    const bigAmount = parseUnits(amount, data.balance.decimals);
    if (bigAmount > data.balance.raw) {
      toast.error('Insufficient balance', {
        description: `You don't have enough ${data.balance.symbol} to place this deposit.`,
      });
      return;
    }

    const transaction: SendTransactionParameters<Chain, Account>[] = [
      {
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'queueLiquidityChange',
          args: [0, bigAmount],
        }),
      },
    ];

    if (data.allowance.raw < bigAmount) {
      transaction.unshift({
        to: grindAddresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi: grindAbi,
          functionName: 'approve',
          args: [addresses[abstractTestnet.id], bigAmount],
        }),
      });
    }

    sendTransaction({ transaction, onSuccess: refetch });
  }

  function handleWithdraw(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client) {
      toast.error('Not connected', {
        description: `Please connect abstract before placing a bet.`,
      });
      return;
    }

    if (!data) return;

    const formData = new FormData(event.currentTarget);
    const amount = formData.get('amount') as string;

    if (!amount) {
      toast.error('Invalid Withdraw', {
        description: `Please enter a valid amount.`,
      });
      return;
    }

    const bigAmount = parseUnits(amount, 18);
    if (bigAmount > data.shares.raw) {
      toast.error('Insufficient shares', {
        description: `You don't have enough shares to place this withdraw.`,
      });
      return;
    }

    const transaction: SendTransactionParameters<Chain, Account>[] = [
      {
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'queueLiquidityChange',
          args: [1, bigAmount],
        }),
      },
    ];

    sendTransaction({ transaction, onSuccess: refetch });
  }

  function handleBalanceClicked(event: React.MouseEvent<HTMLButtonElement>) {
    if (!data) return;

    const input = event.currentTarget
      .closest('form')
      ?.querySelector('input[name="amount"]') as HTMLInputElement;
    if (input) {
      input.value = data?.balance.formatted;
    }
  }

  function handleSharesClicked(event: React.MouseEvent<HTMLButtonElement>) {
    if (!data) return;

    const input = event.currentTarget
      .closest('form')
      ?.querySelector('input[name="amount"]') as HTMLInputElement;
    if (input) {
      input.value = data?.shares.formatted;
    }
  }

  useEffect(() => {
    if (!state || !number) return;

    if (state.end === number - 1) {
      // Game Crashed
      setEnded(true);
    } else if (!state.end && state.start + multipliers.length - 1 === number) {
      // Game reached 100x
      setEnded(true);
    } else if (ended && oldState) {
      // Game has been reset
      refetch();
      setEnded(false);
    }
  }, [ended, number, oldState, refetch, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-muted-foreground h-min text-xs"
          size="sm"
          type="button"
        >
          <Wrench className="size-3 fill-current" />
          <span>
            <span className="hidden sm:inline">Manage</span> Liquidity
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[95vh] flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Liquidity</DialogTitle>
          <DialogDescription>
            Manage your liquidity positions and view your current holdings.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 overflow-x-hidden overflow-y-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Shares</p>
              <p className="text-muted-foreground text-sm">
                {data?.totalShares.rounded} {data?.totalShares.symbol}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Your Shares</p>
              <p className="text-muted-foreground text-sm">
                {data?.shares.rounded} {data?.shares.symbol}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Value</p>
              <p className="text-muted-foreground text-sm">
                {data?.value.rounded} {data?.value.symbol}
              </p>
            </div>
          </div>

          {data?.queue.length ? (
            <div className="mt-3 flex flex-col gap-2">
              <h2 className="text-sm font-medium">Liquidity Queue</h2>
              <table className="border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Action</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.queue.map((item, index) => {
                    if (item.action === 'Deposit') {
                      // Deposit
                      return (
                        <tr key={index}>
                          <td className="rounded-l border-y border-l pl-2 text-left">Deposit</td>
                          <td className="rounded-r border-y border-r pr-2 text-right">
                            {item.tokens?.rounded} {item.tokens?.symbol}
                          </td>
                        </tr>
                      );
                    } else {
                      // Withdraw
                      return (
                        <tr key={index}>
                          <td className="rounded-l border-y border-l pl-2 text-left">Withdraw</td>
                          <td className="rounded-r border-y border-r pr-2 text-right">
                            {item.shares?.rounded} {item.shares?.symbol}
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-3 flex gap-5">
            <form className="flex flex-col gap-2" onSubmit={handleDeposit}>
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="mb-1">
                  Deposit
                </Label>

                <button
                  type="button"
                  className="text-muted-foreground cursor-pointer text-sm hover:underline"
                  onClick={handleBalanceClicked}
                >
                  {data?.balance.rounded} {data?.balance.symbol}
                </button>
              </div>
              <Input id="amount" name="amount" type="text" placeholder="0.00" className="w-full" />
              <Button type="submit" className="w-full" disabled={isPending}>
                Deposit
              </Button>
            </form>
            <form className="flex flex-col gap-2" onSubmit={handleWithdraw}>
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="mb-1">
                  Withdraw
                </Label>

                <button
                  type="button"
                  className="text-muted-foreground cursor-pointer text-sm hover:underline"
                  onClick={handleSharesClicked}
                >
                  {data?.shares.rounded} {data?.shares.symbol}
                </button>
              </div>
              <Input id="amount" name="amount" type="text" placeholder="0.00" className="w-full" />
              <Button type="submit" className="w-full" disabled={isPending}>
                Withdraw
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
