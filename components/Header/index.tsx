'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatAddress } from '@/utils/functions'
import { useXueNfts, useXuNfts } from '@/utils/nft'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import {
  BellDot,
  Check,
  ChevronsUpDown,
  HelpCircle,
  PanelLeft,
  Plus,
  Search,
  Settings,
  TriangleAlert,
  User2,
} from 'lucide-react'
import { useAccount } from 'wagmi'

import { mockXNodes } from '@/config/demo-mode'
import { cn, formatSelectedXNodeName } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { GlobalSearch } from '@/components/global-search'
import {
  useSelectedXNode,
  type SelectedXnode,
} from '@/components/selected-xnode'
import { useXnodes } from '@/app/dashboard/health-data'

import { useDemoModeContext } from '../demo-mode'
import { Button } from '../ui/button'
import ActivateXNodeDialog from '../xnode/activate-dialog'

export default function Header({ sessionToken }: { sessionToken?: string }) {
  const { address, status } = useAccount()
  const { data: activeXNodes } = useXuNfts(address)
  const { data: inactiveXNodes } = useXueNfts(address)
  const { data: deployedXnodes } = useXnodes(sessionToken)

  const { open } = useWeb3Modal()
  const { push } = useRouter()

  const { demoMode, setDemoMode } = useDemoModeContext()

  const allXnodes: SelectedXnode[] = demoMode
    ? mockXNodes.map((xnode) => {
        return { type: 'Unit', id: BigInt(xnode.deploymentAuth) }
      })
    : (deployedXnodes ?? [])
        .filter(
          (xnode) =>
            !xnode.isUnit ||
            !activeXNodes?.includes(BigInt(xnode.deploymentAuth))
        )
        .map((xnode) => {
          if (xnode.isUnit) {
            return {
              type: 'Unit',
              id: BigInt(xnode.deploymentAuth),
            } as SelectedXnode
          }
          return { type: 'Custom', id: xnode.id } as SelectedXnode
        })
        .concat(
          (activeXNodes ?? []).map((nftId) => {
            return { type: 'Unit', id: nftId } as SelectedXnode
          })
        )

  const { selectedXNode, selectXNode } = useSelectedXNode()

  useEffect(() => {
    if (!allXnodes.length) {
      // No nodes
      selectXNode(null)
      return
    }

    if (
      selectedXNode &&
      allXnodes.some(
        (xnode) =>
          xnode.type === selectedXNode.type && xnode.id === selectedXNode.id
      )
    ) {
      // There is a valid node selected
      return
    }

    selectXNode(allXnodes.at(0))
  }, [selectedXNode, selectXNode, allXnodes])

  const totalNodes = (activeXNodes?.length ?? 0) + (inactiveXNodes?.length ?? 0)

  const [activationOpen, setActivationOpen] = useState<bigint | undefined>(
    undefined
  )

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
    if (window.location.pathname.endsWith('login')) {
      // If we are already on the login page, they probably want the wallet popup
      open()
      return
    }

    push('/login')
  }

  return (
    <>
      <ActivateXNodeDialog
        address={address}
        open={!!activationOpen}
        onOpenChange={() => setActivationOpen(undefined)}
        entitlementNft={activationOpen}
      />
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
              OpenxAI<sup className="relative top-[-10px] text-xs font-normal">Studio</sup>
            </div>
            <Popover>
              <PopoverTrigger className="flex h-9 min-w-56 items-center justify-between rounded border border-background/15 bg-background/10 px-3 text-sm text-background max-hdplus:min-w-48 max-hdplus:text-xs">
                <span className="flex items-center gap-1.5">
                  <PanelLeft className="size-3.5" />
                  {selectedXNode
                    ? formatSelectedXNodeName(selectedXNode)
                    : 'Select your Xnode...'}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  {totalNodes > 4 ? (
                    <CommandInput placeholder="Search your Xnode" />
                  ) : null}
                  <CommandList>
                    <CommandEmpty>
                      <span className="max-hdplus:text-xs">
                        No Xnode found.
                      </span>
                    </CommandEmpty>
                    <CommandGroup heading="Active">
                      {allXnodes.map((xNode) => {
                        const name = formatSelectedXNodeName(xNode)
                        return (
                          <CommandItem
                            key={name}
                            value={name}
                            keywords={[name]}
                            onSelect={(val) => selectXNode(xNode)}
                          >
                            <Check
                              className={cn(
                                'mr-2 size-4 transition-transform',
                                selectedXNode &&
                                  formatSelectedXNodeName(selectedXNode) ===
                                    name
                                  ? 'scale-100'
                                  : 'scale-0'
                              )}
                            />
                            {name}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                    {(inactiveXNodes?.length ?? 0) > 0 && !demoMode ? (
                      <CommandGroup heading="Inactive">
                        {inactiveXNodes?.map((xNode) => {
                          const name = formatSelectedXNodeName({
                            type: 'Unit',
                            id: xNode,
                          })
                          return (
                            <CommandItem
                              key={name}
                              value={name}
                              keywords={[name]}
                              className="justify-between"
                              onSelect={() => setActivationOpen(xNode)}
                            >
                              {name}
                              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                activate
                              </span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    ) : null}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                <BellDot
                  className="size-5 max-hdplus:size-4"
                  strokeWidth={1.5}
                />
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
    </>
  )
}
