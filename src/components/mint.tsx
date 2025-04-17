import { abi, addresses } from '@/contracts/grind';
import { ABSTRACT_APP_ID } from '@/lib/abstract';
import { CrossAppAccountWithMetadata, useCrossAppAccounts, usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { encodeFunctionData, Hex } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useTransactionReceipt } from 'wagmi';
import { Button } from './ui/button';

interface MintProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

export const Mint: React.FC<MintProps> = ({ onSuccess, disabled }) => {
  const { user } = usePrivy();
  const { sendTransaction } = useCrossAppAccounts();

  const account = user?.linkedAccounts.find(
    account => account.type === 'cross_app' && account.providerApp.id === ABSTRACT_APP_ID
  ) as CrossAppAccountWithMetadata | undefined;

  const mint = useMutation({
    mutationKey: ['mint-grind'],
    mutationFn: async () => {
      if (!account) {
        toast.error('Connect Abstract', {
          id: 'minting-tokens',
          description: 'You need to connect your Abstract wallet to mint tokens.',
        });
        return;
      }

      const hash = await sendTransaction(
        {
          to: addresses[abstractTestnet.id],
          data: encodeFunctionData({
            abi,
            functionName: 'mint',
          }),
          chainId: abstractTestnet.id,
        },
        {
          address: account.embeddedWallets[0].address,
        }
      );

      return hash as Hex;
    },
    onMutate() {
      toast.loading('Minting Tokens', {
        id: 'minting-tokens',
      });
    },
    onError() {
      toast.error('Minting Failed', {
        id: 'minting-tokens',
      });
    },
  });

  const mintReceipt = useTransactionReceipt({
    hash: mint.data,
  });

  function handleMint() {
    mint.mutate();
  }

  useEffect(() => {
    if (mintReceipt.isSuccess) {
      toast.success('Transaction Success', {
        id: 'minting-tokens',
      });
      onSuccess?.();
    }

    if (mintReceipt.isError) {
      toast.error('Transaction Failed', {
        id: 'minting-tokens',
      });
    }
  }, [mintReceipt.isSuccess, mintReceipt.isError, onSuccess]);

  return (
    <Button
      variant="link"
      type="button"
      className="ml-auto h-min p-0"
      size="sm"
      onClick={handleMint}
      disabled={disabled}
    >
      mint tokens
    </Button>
  );
};
