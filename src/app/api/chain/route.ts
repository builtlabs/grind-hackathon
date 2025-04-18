import 'server-only';
import { createHmac } from 'node:crypto';
import { encodeFunctionData, type Hex } from 'viem';
import { env } from '@/env.mjs';
import { fetcher } from '@/lib/fetch';
import { ContractState } from '../game/types';
import { walletClient } from '@/server/master';
import { abi, addresses } from '@/contracts/block-crash';
import { abstractTestnet } from 'viem/chains';
import { multipliers } from '@/lib/block-crash';

interface BodyShape {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    data: {
      block: {
        hash: Hex;
        number: number;
        timestamp: number;
      };
    };
    sequenceNumber: string;
  };
}

export async function POST(request: Request) {
  const signature = request.headers.get('x-alchemy-signature');

  const body = await request.text();
  console.log(body); // TODO: remove once we are confident the contracts are integrated correctly

  if (env.NODE_ENV !== 'development') {
    if (!signature) {
      console.log(`⚠️ Webhook missing signature.`);
      return new Response('Missing signature', { status: 400 });
    }

    if (!verifySignature(signature, body)) {
      console.log(`⚠️ Webhook signature verification failed.`);
      return new Response('Invalid signature', { status: 400 });
    }
  }

  const data = JSON.parse(body) as BodyShape;

  console.log(`🔔 Webhook received: ${data.type} ${data.event.data.block.number}!`);
  const state = await fetcher<ContractState>(
    `/api/game?blockNumber=${data.event.data.block.number}`
  );

  const crashed =
    state.end === data.event.data.block.number - 1 ||
    data.event.data.block.number === state.start + multipliers.length - 1;
  console.log(
    `🔍 Current game state: ${JSON.stringify({
      block: data.event.data.block.number,
      start: state.start,
      end: state.end,
      crashed,
    })}`
  );

  if (crashed) {
    console.log(`🏁 Game ended at block ${data.event.data.block.number - 1}`);

    try {
      const hash = await walletClient.sendTransaction({
        to: addresses[abstractTestnet.id],
        data: encodeFunctionData({
          abi,
          functionName: 'reset',
        }),
      });

      console.log(`🔁 Game reset transaction sent: ${hash}`);
    } catch (error) {
      console.error(`⚠️ Error sending reset transaction: ${error}`);
    }
  }

  return new Response('OKAY', { status: 200 });
}

function verifySignature(signature: string, body: string) {
  const hmac = createHmac('sha256', env.ALCHEMY_SECRET);
  hmac.update(body);
  const digest = hmac.digest('hex');

  return signature === digest;
}
