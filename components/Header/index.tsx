'use client'

import { useRouter } from 'next/navigation'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { BellDot, HelpCircle, Settings, TriangleAlert } from 'lucide-react'
import { useAccount } from 'wagmi'

import { cn } from '@/lib/utils'

import { SimpleTooltip } from '../Common/SimpleTooltip'
import { useDemoModeContext } from '../demo-mode'
import { Button } from '../ui/button'

export default function Header() {
  const { address, status,isConnected } = useAccount()
 
  const { open } = useWeb3Modal()
  const { push } = useRouter()

  const { demoMode, setDemoMode } = useDemoModeContext()

  const pressWalletButton = () => {
  if(isConnected){
    open()
  }else{
    open({ view: 'Connect' }).catch(console.error);
  }
    
  }

  return (
    <header
      className={cn(
        'sticky inset-x-0 top-0 z-50 flex h-20 flex-col bg-foreground max-hdplus:h-16',
        demoMode && 'h-24 max-hdplus:h-20'
      )}
    >
      {demoMode && (
        <div className="flex h-6 w-full place-content-center gap-x-1 bg-orange-300 text-foreground">
          <TriangleAlert />
          <span>
            Xnode Studio is in Demo Mode. Information and interactions are for
            showcasing only.
          </span>
          <Button
            className="m-0 size-auto bg-transparent p-0 text-black underline hover:bg-transparent"
            onClick={() => {
              setDemoMode(false)
              push('/')
            }}
          >
            <span>EXIT</span>
          </Button>
        </div>
      )}
      <div className="flex grow items-center justify-between gap-x-32 px-6 max-hdplus:gap-x-20">
        <div className="flex items-center gap-6">
          <div className="shrink-0 text-3xl font-bold text-background max-hdplus:text-xl">
            OpenxAI
            <sup className="relative top-[-10px] text-xs font-normal">
              Studio
            </sup>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-gray-300">
            <SimpleTooltip tooltip="Coming Soon!">
              <button
                disabled
                type="button"
                className="flex size-9 items-center justify-center rounded transition-colors hover:bg-background/10 disabled:pointer-events-none max-hdplus:size-8"
              >
                <span className="sr-only">Notifications</span>
                <BellDot
                  className="size-7 max-hdplus:size-6"
                  strokeWidth={1.5}
                />
              </button>
            </SimpleTooltip>
            <SimpleTooltip tooltip="Coming Soon!">
              <button
                disabled
                type="button"
                className="flex size-9 items-center justify-center rounded transition-colors hover:bg-background/10 disabled:pointer-events-none max-hdplus:size-8"
              >
                <span className="sr-only">Help</span>
                <HelpCircle
                  className="size-7 max-hdplus:size-6"
                  strokeWidth={1.5}
                />
              </button>
            </SimpleTooltip>
            <SimpleTooltip tooltip="Coming Soon!">
              <button
                disabled
                type="button"
                className="flex size-9 items-center justify-center rounded transition-colors hover:bg-background/10 disabled:pointer-events-none max-hdplus:size-8"
              >
                <span className="sr-only">Settings</span>
                <Settings
                  className="size-7 max-hdplus:size-6"
                  strokeWidth={1.5}
                />
              </button>
            </SimpleTooltip>
          </div>
          {!address && status === 'disconnected' && !demoMode ? (
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded bg-gray-700 px-4 text-base font-semibold tracking-tighter text-background max-hdplus:h-8 max-hdplus:text-sm"
              onClick={pressWalletButton}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded bg-gray-700 px-3 text-sm text-background"
              onClick={pressWalletButton}
            >
              {demoMode ? (
                'DEMO'
              ) : address && status === 'connected' ? (
                `${address.slice(0, 7)}...${address.slice(-9)}`
              ) : (
                <span className="h-6 w-20 animate-pulse rounded bg-white/20" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
