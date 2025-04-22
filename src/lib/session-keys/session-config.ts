import { Address, getAbiItem, parseEther, toFunctionSelector } from 'viem';
import { LimitType, SessionConfig } from '@abstract-foundation/agw-client/sessions';
import { abi as blockCrashAbi, addresses as blockCrashAddresses } from '@/contracts/block-crash';
import { abi as grindAbi, addresses as grindAddresses } from '@/contracts/grind';
import { abstractTestnet } from 'viem/chains';

export function getSessionConfig(signer: Address): SessionConfig {
  return {
    signer,
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24),
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: parseEther('1'),
      period: BigInt(0),
    },
    callPolicies: [
      // {
      //   target: grindAddresses[abstractTestnet.id],
      //   selector: toFunctionSelector(getAbiItem({ abi: grindAbi, name: 'approve' })),
      //   valueLimit: {
      //     limitType: LimitType.Unlimited,
      //     limit: BigInt(0),
      //     period: BigInt(0),
      //   },
      //   maxValuePerUse: BigInt(0),
      //   constraints: [
      //     {
      //       condition: ConstraintCondition.Equal,
      //       index: 0n,
      //       refValue: encodeAbiParameters(
      //         [{ type: 'address' }],
      //         [blockCrashAddresses[abstractTestnet.id]]
      //       ),
      //       limit: {
      //         limitType: LimitType.Unlimited,
      //         limit: BigInt(0),
      //         period: BigInt(0),
      //       },
      //     },
      //   ],
      // },
      {
        target: blockCrashAddresses[abstractTestnet.id],
        selector: toFunctionSelector(getAbiItem({ abi: blockCrashAbi, name: 'placeBet' })),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: BigInt(0),
          period: BigInt(0),
        },
        maxValuePerUse: BigInt(0),
        constraints: [],
      },
      {
        target: blockCrashAddresses[abstractTestnet.id],
        selector: toFunctionSelector(getAbiItem({ abi: blockCrashAbi, name: 'cancelBet' })),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: BigInt(0),
          period: BigInt(0),
        },
        maxValuePerUse: BigInt(0),
        constraints: [],
      },
      {
        target: blockCrashAddresses[abstractTestnet.id],
        selector: toFunctionSelector(getAbiItem({ abi: blockCrashAbi, name: 'cashEarly' })),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: BigInt(0),
          period: BigInt(0),
        },
        maxValuePerUse: BigInt(0),
        constraints: [],
      },
      // {
      //   target: blockCrashAddresses[abstractTestnet.id],
      //   selector: toFunctionSelector(
      //     getAbiItem({ abi: blockCrashAbi, name: 'queueLiquidityChange' })
      //   ),
      //   valueLimit: {
      //     limitType: LimitType.Unlimited,
      //     limit: BigInt(0),
      //     period: BigInt(0),
      //   },
      //   maxValuePerUse: BigInt(0),
      //   constraints: [],
      // },
      {
        target: grindAddresses[abstractTestnet.id],
        selector: toFunctionSelector(getAbiItem({ abi: grindAbi, name: 'mint' })),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: BigInt(0),
          period: BigInt(0),
        },
        maxValuePerUse: BigInt(0),
        constraints: [],
      },
    ],
    transferPolicies: [],
  };
}
