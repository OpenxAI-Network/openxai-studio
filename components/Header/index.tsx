'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatAddress } from '@/utils/functions'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import {
  BellDot,
  HelpCircle,
  Plus,
  Search,
  Settings,
  TriangleAlert,
  User2,
} from 'lucide-react'
import { useAccount } from 'wagmi'

import { cn } from '@/lib/utils'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { GlobalSearch } from '@/components/global-search'

import { useDemoModeContext } from '../demo-mode'
import { Button } from '../ui/button'

export default function Header() {
  const { address, status } = useAccount()

  const { open } = useWeb3Modal()
  const { push } = useRouter()

  const { demoMode, setDemoMode } = useDemoModeContext()

  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setGlobalSearchOpen(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const pressWalletButton = () => {
    open()
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
        <Popover open={globalSearchOpen} onOpenChange={setGlobalSearchOpen}>
          <PopoverTrigger className="flex h-9 min-w-56 max-w-lg grow items-center justify-between gap-3 rounded border border-background/15 bg-background/10 px-3 text-muted transition-colors hover:bg-background/15">
            <span className="flex items-center gap-3">
              <Search className="size-4 max-hdplus:size-3" />
              <span className="text-sm max-hdplus:text-xs">
                Search & Run Commands
              </span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-muted-foreground/50 bg-foreground/50 px-1.5 font-mono text-[10px] font-medium text-muted opacity-100 max-hdplus:h-4">
              <span className="text-xs">⌘</span>K
            </kbd>
          </PopoverTrigger>
          <GlobalSearch onSelect={() => setGlobalSearchOpen(false)} />
        </Popover>
        <div className="flex items-center gap-6">
          <button
            disabled
            type="button"
            className="flex size-9 items-center justify-center rounded bg-primary text-background transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 max-hdplus:size-8"
          >
            <Plus className="size-5 max-hdplus:size-4" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2 text-background">
            <button
              disabled
              type="button"
              className="flex size-9 items-center justify-center rounded transition-colors hover:bg-background/10 disabled:pointer-events-none disabled:opacity-50 max-hdplus:size-8"
            >
              <span className="sr-only">Notifications</span>
              <BellDot className="size-5 max-hdplus:size-4" strokeWidth={1.5} />
            </button>
            <button
              disabled
              type="button"
              className="flex size-9 items-center justify-center rounded transition-colors hover:bg-background/10 disabled:pointer-events-none disabled:opacity-50 max-hdplus:size-8"
            >
              <span className="sr-only">Help</span>
              <HelpCircle
                className="size-5 max-hdplus:size-4"
                strokeWidth={1.5}
              />
            </button>
            <button
              disabled
              type="button"
              className="flex size-9 items-center justify-center rounded transition-colors hover:bg-background/10 disabled:pointer-events-none disabled:opacity-50 max-hdplus:size-8"
            >
              <span className="sr-only">Settings</span>
              <Settings
                className="size-5 max-hdplus:size-4"
                strokeWidth={1.5}
              />
            </button>
          </div>
          {!address && status === 'disconnected' && !demoMode ? (
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded bg-primary px-4 text-base font-semibold tracking-tighter text-background max-hdplus:h-8 max-hdplus:text-sm"
              onClick={pressWalletButton}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded bg-primary px-3 text-sm text-background"
              onClick={pressWalletButton}
            >
              <User2 className="size-4" />
              {demoMode ? (
                'DEMO'
              ) : address && status === 'connected' ? (
                formatAddress(address)
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
