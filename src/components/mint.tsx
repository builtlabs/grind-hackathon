import { abi, addresses } from '@/contracts/grind';
import { encodeFunctionData } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { Button } from './ui/button';
import { useSendTransaction } from '@/hooks/use-send-transaction';

interface MintProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

export const Mint: React.FC<MintProps> = ({ onSuccess, disabled }) => {
  const { sendTransaction, isPending } = useSendTransaction({
    key: 'mint-grind',
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
      onSuccess,
    });
  }

  return (
    <Button
      variant="link"
      type="button"
      className="text-muted-foreground ml-auto h-min p-0 text-xs"
      size="sm"
      onClick={handleMint}
      disabled={disabled || isPending}
    >
      mint tokens
    </Button>
  );
};
