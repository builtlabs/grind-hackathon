import { useAbstractClient } from '@abstract-foundation/agw-react';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Account, Address, Chain, Hex, SendTransactionParameters } from 'viem';
import { useTransactionReceipt } from 'wagmi';
import { abstractTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { useSessionKey } from './use-session-key';

interface Options {
  key: string;
}

export function useSendTransaction(options: Options) {
  const { data: client, isPending, error } = useAbstractClient();
  const { data: session, isPending: isPendingSession } = useSessionKey();

  const transaction = useMutation({
    mutationKey: [options.key],
    mutationFn: async ({
      transaction,
    }: {
      transaction:
        | SendTransactionParameters<Chain, Account>
        | SendTransactionParameters<Chain, Account>[];
      onSuccess?: () => void;
    }) => {
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

      if (!session) {
        // Send without session
        return client.sendTransactionBatch({
          calls: Array.isArray(transaction) ? transaction : [transaction],
        });
      } else {
        const signer = privateKeyToAccount(session.privateKey);

        const sessionClient = client.toSessionClient(signer, session.session);
        if (Array.isArray(transaction)) {
          sessionClient.batch = {
            multicall: true,
          };

          let hash: Hex | undefined;
          for await (const tx of transaction) {
            hash = await sessionClient.sendTransaction({
              account: sessionClient.account,
              chain: abstractTestnet,
              to: tx.to as Address,
              data: tx.data as Hex,
            });
          }

          return hash;
        } else {
          return sessionClient.sendTransaction({
            account: sessionClient.account,
            chain: abstractTestnet,
            to: transaction.to as Address,
            data: transaction.data as Hex,
          });
        }
      }
    },
    async onMutate() {
      toast.loading('Sending Transaction', {
        id: options.key,
        description: session
          ? 'Sending transaction with turbo mode!'
          : 'Approve the transaction in your Abstract wallet.',
      });
    },
    onError(error) {
      console.error('Transaction error:', error);
      toast.error('Sending Transaction Failed', {
        id: options.key,
        description: 'There was an error sending the transaction.',
        duration: 2000,
      });
    },
  });

  const receipt = useTransactionReceipt({
    hash: transaction.data,
  });

  useEffect(() => {
    if (receipt.isSuccess) {
      toast.success('Transaction Success', {
        id: options.key,
        description: 'Transaction was successful.',
        duration: 2000,
      });
      transaction.variables?.onSuccess?.();
      transaction.reset();
    }

    if (receipt.isError) {
      toast.error('Transaction Failed', {
        id: options.key,
        description: 'Transaction failed. Please try again.',
        duration: 2000,
      });
      transaction.reset();
    }
  }, [receipt.isSuccess, receipt.isError, options, transaction]);

  return {
    sendTransaction: transaction.mutate,
    isPending: transaction.isPending || receipt.isLoading || isPending || isPendingSession,
  };
}
