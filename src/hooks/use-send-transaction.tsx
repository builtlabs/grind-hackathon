import { useAbstractClient } from '@abstract-foundation/agw-react';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Account, Chain, Hex, SendTransactionParameters } from 'viem';
import { useTransactionReceipt } from 'wagmi';

interface Options {
  key: string;
  onSuccess?: () => void;
}

export function useSendTransaction(options: Options) {
  const { data: client, isPending, error } = useAbstractClient();

  const transaction = useMutation({
    mutationKey: [options.key],
    mutationFn: async (transaction: SendTransactionParameters<Chain, Account>) => {
      if (isPending) {
        toast.error('Connect Abstract', {
          id: options.key,
          description: 'You need to connect your Abstract wallet to send transactions.',
        });
        return;
      }

      if (error || !client) {
        toast.error('Abstract Error', {
          id: options.key,
          description: 'There was an error connecting to your Abstract wallet.',
        });
        return;
      }

      const hash = await client.sendTransaction(transaction);

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
