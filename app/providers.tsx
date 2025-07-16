'use client'

import AccountContextProvider from '@/contexts/AccountContext'
import { DemoContextProvider } from '@/contexts/XnodeDemoContext'
import { chain } from '@/utils/chain'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'
import { WagmiProvider, type State } from 'wagmi'

import { Toaster } from '@/components/ui/toaster'
import DemoModeProvider from '@/components/demo-mode'
import ScreenProvider from '@/components/screen-provider'
import SelectedXnodeProvider from '@/components/selected-xnode'

export const chains = [chain] as const
const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo_id'

const metadata = {
  name: 'Xnode',
  description:
    'Your Gateway to Building Personalized Data Ecosystems in minutes, instead of weeks.',
  url: 'https://www.openmesh.network/xnode',
  icons: ['https://www.openmesh.network/xnode/openmesh.svg'],
}

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
})

createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
  themeMode: 'light',
  themeVariables: {
    '--w3m-border-radius-master': '0.375px',
    '--w3m-accent': 'hsl(var(--primary))',
  },
})

const disconnectWallet = async () => {
  try {
    // Get the current connector from wagmiConfig
    const connector = wagmiConfig.state.connections.values().next()
      .value?.connector

    if (connector && typeof connector.disconnect === 'function') {
      await connector.disconnect()
    } else if (
      connector?.provider &&
      typeof connector.provider.disconnect === 'function'
    ) {
      await connector.provider.disconnect()
    } else {
      // Fallback: just reset the connection state without calling disconnect
      console.warn(
        'WalletConnect disconnect method not available, using fallback'
      )
      // Add any state reset logic here
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error)
  }
}

export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: State
}) {
  return (
    <AccountContextProvider>
      <WagmiProvider config={wagmiConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" enableSystem={false}>
            <DemoModeProvider>
              <SelectedXnodeProvider>
                <DemoContextProvider>
                  <ScreenProvider>
                    {children}
                    <ToastContainer />
                    <Toaster />
                  </ScreenProvider>
                </DemoContextProvider>
              </SelectedXnodeProvider>
            </DemoModeProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AccountContextProvider>
  )
}
