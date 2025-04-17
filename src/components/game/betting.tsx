'use client';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { abstractTestnet } from 'viem/chains';
import { Mint } from '../mint';
import { useSendTransaction } from '@/hooks/use-send-transaction';
import { useGrindBalance } from '@/hooks/use-grind-balance';
import { encodeFunctionData, formatUnits, parseUnits } from 'viem';
import { abi, addresses } from '@/contracts/block-crash';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { multipliers } from '@/lib/block-crash';
import { useGame } from '../providers/game';
import { toast } from 'sonner';

export const Betting: React.FC = () => {
  const { state } = useGame();
  const { sendTransaction } = useSendTransaction({
    key: 'mint-grind',
  });

  const grind = useGrindBalance();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!grind.data || !state) return;

    const formData = new FormData(e.currentTarget);
    const amount = formData.get('amount') as string;
    const multiplier = formData.get('multiplier') as string;

    const bigAmount = parseUnits(amount, grind.data.decimals);

    console.log('amount', amount);
    console.log('bigAmount', bigAmount);
    console.log('liquidity', state.liquidity);
    console.log('multiplier', multiplier);

    if (bigAmount > BigInt(state.liquidity)) {
      toast.error('Bet too large', {
        description: `Your bet amount is larger than the current liquidity of the game.`,
      });
    }

    // TODO: approve the tokens
    sendTransaction({
      to: addresses[abstractTestnet.id],
      data: encodeFunctionData({
        abi,
        functionName: 'placeBet',
        args: [bigAmount, BigInt(multiplier)],
      }),
    });
  }

  return (
    <div className="flex flex-col">
      <form className="flex w-80 flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount" className="mb-1">
              Bet Amount
            </Label>

            <span className="text-sm text-gray-500">
              {grind.data?.formatted} {grind.data?.symbol}
            </span>
          </div>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="0.00"
            className="w-full"
            min={0}
            step={0.01}
          />
          <Mint onSuccess={grind.refetch} disabled={grind.data && grind.data?.value >= 500} />
        </div>

        <div className="flex flex-col">
          <Label htmlFor="multiplier" className="mb-1">
            Auto Cashout
          </Label>
          <Select name="multiplier" defaultValue="49">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {multipliers.map((multiplier, index) => (
                <SelectItem key={multiplier} value={index.toString()}>
                  {formatUnits(multiplier, 6)}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="mt-4 w-full" type="submit">
          Place Bet
        </Button>
      </form>
    </div>
  );
};
