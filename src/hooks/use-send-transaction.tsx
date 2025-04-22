import { useAbstractClient } from '@abstract-foundation/agw-react';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Account, Address, BaseError, Chain, Hex, SendTransactionParameters } from 'viem';
import { useAccount, useTransactionReceipt } from 'wagmi';
import { abstractTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { useSessionKey } from './use-session-key';
import { getGeneralPaymasterInput } from 'viem/zksync';
import { PAYMASTER_ADDRESS } from '@/lib/paymaster';

interface Options {
  key: string;
}

export function useSendTransaction(options: Options) {
  const { isConnected } = useAccount();
  const { data: client, error, refetch } = useAbstractClient();
  const { data: session, isPending: isPendingSession } = useSessionKey();

  const transaction = useMutation({
    mutationKey: [options.key],
    mutationFn: async ({
      transaction,
      useSession = true,
    }: {
      transaction:
        | SendTransactionParameters<Chain, Account>
        | SendTransactionParameters<Chain, Account>[];
      onSuccess?: () => void;
      useSession?: boolean;
    }) => {
      if (!isConnected) {
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

      if (!session || !useSession) {
        // Send without session
        return client.sendTransactionBatch({
          calls: Array.isArray(transaction) ? transaction : [transaction],
          paymaster: PAYMASTER_ADDRESS,
          paymasterInput: getGeneralPaymasterInput({
            innerInput: '0x',
          }),
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
              paymaster: PAYMASTER_ADDRESS,
              paymasterInput: getGeneralPaymasterInput({
                innerInput: '0x',
              }),
            });
          }

          return hash;
        } else {
          return sessionClient.sendTransaction({
            account: sessionClient.account,
            chain: abstractTestnet,
            to: transaction.to as Address,
            data: transaction.data as Hex,
            paymaster: PAYMASTER_ADDRESS,
            paymasterInput: getGeneralPaymasterInput({
              innerInput: '0x',
            }),
          });
        }
      }
    },
    async onMutate({ useSession = true }) {
      toast.loading('Sending Transaction', {
        id: options.key,
        description:
          session && useSession
            ? 'Sending transaction with turbo mode!'
            : 'Approve the transaction in your Abstract wallet.',
      });
    },
    onError(error) {
      console.error('Transaction error:', JSON.stringify(error, null, 2));
      if (error instanceof Error && error instanceof BaseError) {
        if (error.details === 'Failed to initialize request') {
          toast.error('Sending Transaction Failed', {
            id: options.key,
            description: 'Pop-up Blocked, please allow pop-ups for this site.',
            duration: 10000,
          });
        } else {
          toast.error('Sending Transaction Failed', {
            id: options.key,
            description: error.shortMessage,
            duration: 2000,
          });
        }
      } else if (error instanceof Error) {
        toast.error('Sending Transaction Failed', {
          id: options.key,
          description: error.message,
          duration: 2000,
        });
      } else {
        toast.error('Sending Transaction Failed', {
          id: options.key,
          description: 'There was an error sending the transaction.',
          duration: 2000,
        });
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.isSuccess, receipt.isError, options.key]);

  useEffect(() => {
    if (!isConnected) {
      refetch();
    }
  }, [isConnected, refetch]);

  return {
    sendTransaction: transaction.mutate,
    isPending: transaction.isPending || receipt.isLoading || !isConnected || isPendingSession,
  };
}
