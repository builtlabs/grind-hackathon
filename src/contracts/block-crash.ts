import { abstractTestnet } from 'viem/chains';

export const abi = [
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'grind_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'BetTooLargeError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BetsClosedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAccessError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidActionError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidBlockError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCashoutError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSenderError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotYourBetError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RoundNotOverError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RoundNotStartedError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RoundOverError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RoundStartedError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAmountError',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenDelta',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareDelta',
        type: 'uint256',
      },
    ],
    name: 'LiquidityAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint8',
        name: 'action',
        type: 'uint8',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'LiquidityChangeQueued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenDelta',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareDelta',
        type: 'uint256',
      },
    ],
    name: 'LiquidityRemoved',
    type: 'event',
  },
  {
    inputs: [],
    name: 'GRIND',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MULTIPLIER_DENOMINATOR',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PROBABILITY_DENOMINATOR',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ROUND_BUFFER',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ROUND_LENGTH',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'cancelBet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'cashEarly',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBets',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'cashoutIndex',
            type: 'uint64',
          },
          {
            internalType: 'bool',
            name: 'cancelled',
            type: 'bool',
          },
        ],
        internalType: 'struct HashCrash.Bet[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'getBetsFor',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'cashoutIndex',
            type: 'uint64',
          },
          {
            internalType: 'bool',
            name: 'cancelled',
            type: 'bool',
          },
        ],
        internalType: 'struct HashCrash.Bet[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'getHistory',
    outputs: [
      {
        internalType: 'uint32[]',
        name: '',
        type: 'uint32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLiquidityQueue',
    outputs: [
      {
        components: [
          {
            internalType: 'uint8',
            name: 'action',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        internalType: 'struct HashCrash.LiquidityDelta[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRoundInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: 'sb',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'eb',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lq',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'getShares',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalShares',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: '_autoCashout',
        type: 'uint64',
      },
    ],
    name: 'placeBet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: '_action',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'queueLiquidityChange',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const addresses = {
  [abstractTestnet.id]: '0x49C3796675917DDc5D591dE75E4b2002dB480113',
} as const;
