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
import DeploymentQueueProvider from '@/components/deployment-queue'
import ScreenProvider from '@/components/screen-provider'
import SelectedXnodeProvider from '@/components/selected-xnode'
import SignatureCacheProvider from '@/components/signature-cache'
import { LoadingProvider } from '@/contexts/LoadingContext'

export const chains = [chain] as const
const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo_id'

const metadata = {
  name: 'OpenxAI Studio',
  description: 'Build AI applications & agents in lightning speed.',
  url: 'https://studio.openxai.org',
  icons: ['https://studio.openxai.org/images/openxai-logo.png'],
}

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  auth: {
    email: false,
    socials: [],
  },
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
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
  ],
})

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
            <LoadingProvider>
            <DemoModeProvider>
              <SelectedXnodeProvider>
                <DemoContextProvider>
                  <SignatureCacheProvider>
                    <DeploymentQueueProvider>
                      <ScreenProvider>
                        
                          {children}
                        
                        <ToastContainer />
                        <Toaster />
                      </ScreenProvider>
                    </DeploymentQueueProvider>
                  </SignatureCacheProvider>
                </DemoContextProvider>
              </SelectedXnodeProvider>
            </DemoModeProvider>
            </LoadingProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AccountContextProvider>
  )
}
