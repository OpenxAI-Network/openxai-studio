import { base, baseSepolia } from 'wagmi/chains'

export const chain = process.env.NEXT_PUBLIC_TESTNET ? baseSepolia : base
