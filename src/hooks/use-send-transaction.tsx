import { useAbstractClient } from '@abstract-foundation/agw-react';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Account, Address, Chain, Hex, SendTransactionParameters } from 'viem';
import { useTransactionReceipt } from 'wagmi';
import { useAbstractSession } from './use-abstract-session';
import { abstractTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

interface Options {
  key: string;
  onSuccess?: () => void;
}

export function useSendTransaction(options: Options) {
  const { data: client, isPending, error } = useAbstractClient();
  const { getStoredSession } = useAbstractSession(abstractTestnet);

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

      const data = await getStoredSession();

      if (!data) {
        // Send without session
        return client.sendTransactionBatch({
          calls: Array.isArray(transaction) ? transaction : [transaction],
        });
      } else {
        const signer = privateKeyToAccount(data.privateKey);

        const sessionClient = client.toSessionClient(signer, data.session);
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

          // return sessionClient.sendTransaction({
          //   account: sessionClient.account,
          //   chain: abstractTestnet,
          //   to: addresses[abstractTestnet.id],
          //   data: encodeFunctionData({
          //     abi,
          //     functionName: 'aggregate3',
          //     args: [
          //       transaction.map(tx => ({
          //         target: tx.to as Address,
          //         callData: tx.data as Hex,
          //         allowFailure: false,
          //       })),
          //     ],
          //   }),
          // });
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
    onMutate() {
      toast.loading('Sending Transaction', {
        id: options.key,
        description: 'Approve the transaction in your Abstract wallet.',
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
