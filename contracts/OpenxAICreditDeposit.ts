export const OpenxAICreditDepositContract = {
  address: '0x1EdE9dE47e5E3B8941884e7f5DDa43D82570180D',
  abi: [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
      type: 'function',
      name: 'ADMIN',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'owner',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'renounceOwnership',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'retrieve_erc20',
      inputs: [
        { name: '_token', type: 'address', internalType: 'contract IERC20' },
        { name: '_receiver', type: 'address', internalType: 'address' },
        { name: '_amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'transferOwnership',
      inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'event',
      name: 'OwnershipTransferred',
      inputs: [
        {
          name: 'previousOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'newOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'error',
      name: 'OwnableInvalidOwner',
      inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    },
    {
      type: 'error',
      name: 'OwnableUnauthorizedAccount',
      inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    },
    {
      type: 'error',
      name: 'SafeERC20FailedOperation',
      inputs: [{ name: 'token', type: 'address', internalType: 'address' }],
    },
  ],
} as const
