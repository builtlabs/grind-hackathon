import { ABSTRACT_APP_ID } from '@/lib/abstract';
import {
  CrossAppAccountWithMetadata,
  UnsignedTransactionRequest,
  useCrossAppAccounts,
  usePrivy,
} from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Hex } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { useTransactionReceipt } from 'wagmi';

interface Options {
  key: string;
  onSuccess?: () => void;
}

export function useSendTransaction(options: Options) {
  const { user } = usePrivy();
  const { sendTransaction } = useCrossAppAccounts();

  const account = user?.linkedAccounts.find(
    account => account.type === 'cross_app' && account.providerApp.id === ABSTRACT_APP_ID
  ) as CrossAppAccountWithMetadata | undefined;

  const transaction = useMutation({
    mutationKey: [options.key],
    mutationFn: async (transaction: UnsignedTransactionRequest) => {
      if (!account) {
        toast.error('Connect Abstract', {
          id: options.key,
          description: 'You need to connect your Abstract wallet to send transactions.',
        });
        return;
      }

      const hash = await sendTransaction(
        {
          ...transaction,
          chainId: abstractTestnet.id,
        },
        {
          address: account.embeddedWallets[0].address,
        }
      );

      return hash as Hex;
    },
    onMutate() {
      toast.loading('Sending Transaction', {
        id: options.key,
        description: 'Approve the transaction in your Abstract wallet.',
      });
    },
    onError() {
      toast.error('Sending Transaction Failed', {
        id: options.key,
        description: 'There was an error sending the transaction.',
      });
    },
  });

  const mintReceipt = useTransactionReceipt({
    hash: transaction.data,
  });

  useEffect(() => {
    if (mintReceipt.isSuccess) {
      toast.success('Transaction Success', {
        id: options.key,
      });
      options.onSuccess?.();
    }

    if (mintReceipt.isError) {
      toast.error('Transaction Failed', {
        id: options.key,
      });
    }
  }, [mintReceipt.isSuccess, mintReceipt.isError, options]);

  return {
    sendTransaction: transaction.mutate,
  };
}
