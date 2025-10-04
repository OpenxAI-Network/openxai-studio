import { base, baseSepolia } from '@reown/appkit/networks'

export const chain = process.env.NEXT_PUBLIC_TESTNET ? baseSepolia : base
