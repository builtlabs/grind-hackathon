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
    mutationFn: async (
      transaction:
        | SendTransactionParameters<Chain, Account>
        | SendTransactionParameters<Chain, Account>[]
    ) => {
      if (isPending) {
        toast.error('Connect Abstract', {
          id: options.key,
          description: 'You need to connect your Abstract wallet to send transactions.',
          duration: 2000,
        });
        return;
      }

      if (error || !client) {
        toast.error('Abstract Error', {
          id: options.key,
          description: 'There was an error connecting to your Abstract wallet.',
          duration: 2000,
        });
        return;
      }

      const hash = await client.sendTransactionBatch({
        calls: Array.isArray(transaction) ? transaction : [transaction],
      });

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
        duration: 2000,
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
        description: 'Transaction was successful.',
        duration: 2000,
      });
      options.onSuccess?.();
      transaction.reset();
    }

    if (mintReceipt.isError) {
      toast.error('Transaction Failed', {
        id: options.key,
        description: 'Transaction failed. Please try again.',
        duration: 2000,
      });
      transaction.reset();
    }
  }, [mintReceipt.isSuccess, mintReceipt.isError, options, transaction]);

  return {
    sendTransaction: transaction.mutate,
  };
}
