'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import axios from 'axios'
import { Check, CheckCircle2, Hourglass, Search, X } from 'lucide-react'
import { useAccount, useSignMessage } from 'wagmi'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { CreditsPayment } from '@/components/credits-payment'

import DeploymentProvider from '../../deployment-provider'
import { type Provider as ProviderReturn } from './deployment-panel'

type Provider = {
  name: string
  icon?: string
  features: string[]
  action: {
    label?: string
    description?: string[]
    badge?: string
  }
  disabled?: boolean
  comingSoon?: boolean
  isDecentralized?: boolean
  return?: ProviderReturn
}

interface ProviderSelectorProps {
  selected?: ProviderReturn
  showAll?: boolean
  onSelect: (provider: ProviderReturn) => void
}

function EqualProvider({
  provider1,
  provider2,
}: {
  provider1?: ProviderReturn
  provider2?: ProviderReturn
}) {
  if (provider1?.type === 'demo') {
    return provider2?.type === 'demo'
  }

  if (provider1?.type === 'xnode') {
    return (
      provider2?.type === 'xnode' && provider1.tokenId === provider2.tokenId
    )
  }

  return false
}

export function ProviderSelector({
  selected,
  showAll,
  onSelect,
}: ProviderSelectorProps) {
  const [showExtendedOptions, setShowExtendedOptions] = useState(false)

  const { address } = useAccount()
  const { open } = useWeb3Modal()
  const { data: myServers, refetch: refetchMyServers } = useQuery({
    queryKey: [address ?? ''],
    enabled: !!address,
    queryFn: async () => {
      return await axios
        .get(
          `https://indexer.core.openxai.org/api/ownaiv1/${address}/owner_servers`
        )
        .then(
          (res) =>
            res.data as {
              chain: string
              token_id: string
              controller: string
              expires: number
            }[]
        )
    },
  })

  const providers: Provider[] = (
    myServers
      ?.filter((server) => server.expires > Date.now() / 1000)
      .map((server) => {
        return {
          name: `OwnAIv1 ${server.chain}#${server.token_id}`,
          icon: '/images/xnode-card/silvercard-front.webp',
          features: ['Web3 Ready', 'No KYC'],
          action: { label: 'Owned by you' },
          isDecentralized: true,
          return: {
            type: 'xnode',
            collection: 'ownaiv1',
            chain: server.chain,
            tokenId: server.token_id,
          },
        } as Provider
      }) ?? []
  ).concat([
    {
      name: '30 minutes free trial',
      icon: '/images/xnode-logo/xnode-cube.png',
      features: ['Web3 Ready', 'No KYC'],
      action: {
        description: ["OpenxAI's Community Servers | Slow"],
      },
      isDecentralized: true,
      return: { type: 'demo' },
    },
    {
      name: 'Deploy Now',
      icon: '/images/xnode-card/silvercard-front.webp',
      features: ['Web3 Ready', 'No KYC'],
      action: {
        label: '150 GPU Credits',
        description: ["OpenxAI's Tokenized GPUs | Dedicated", 'Up to 330% APY'],
      },
      isDecentralized: true,
    },
    {
      name: 'Vultr (Washington)',
      icon: '/images/providers/vultr.svg',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$655p/m' },
      disabled: true,
      isDecentralized: false,
    },
    {
      name: 'AWS EC2 (HK)',
      icon: '/images/cloudLogo/aws.png',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$1,321p/m' },
      disabled: true,
      isDecentralized: false,
    },
    {
      name: 'Google Cloud (NYC)',
      icon: '/images/cloudLogo/google-cloud.png',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$1,745p/m' },
      disabled: true,
      isDecentralized: false,
    },
    {
      name: 'Xnode One (Hardware)',
      icon: '/images/xnode-one/back.png',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$0p/m' },
      disabled: true,
      comingSoon: true,
      isDecentralized: true,
    },
  ])

  const displayProviders = showAll
    ? providers
    : selected
      ? [
          ...providers.filter((p) =>
            EqualProvider({ provider1: selected, provider2: p.return })
          ),
        ]
      : providers

  const [paidProvider, setPaidProvider] = useState<string | undefined>(
    undefined
  )

  return (
    <>
      <div className="space-y-3 max-[1250px]:space-y-2">
        {displayProviders.map((provider) => (
          <div
            key={provider.name}
            onClick={() => {
              if (provider.disabled) {
                return
              }

              if (provider.name === 'Deploy Now') {
                if (!address) {
                  open()
                } else {
                  setPaidProvider(provider.name)
                }
              } else {
                onSelect(provider.return)
              }
            }}
            className={cn(
              'relative flex cursor-pointer flex-col place-content-evenly gap-4 rounded-lg border p-4',
              EqualProvider({
                provider1: selected,
                provider2: provider.return,
              }) && 'border-primary bg-primary/5',
              provider.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <div className={cn('flex items-center justify-between')}>
              <div className="flex items-center gap-3 max-[1550px]:gap-2.5 max-[1350px]:gap-2 max-[1250px]:gap-1.5 max-[992px]:gap-1">
                <div
                  className={cn(
                    'max-[1550px]:size-2.75 size-3 rounded-full max-[1350px]:size-2.5 max-[1250px]:size-2 max-[992px]:size-1.5',
                    EqualProvider({
                      provider1: selected,
                      provider2: provider.return,
                    })
                      ? 'bg-primary'
                      : 'border border-muted-foreground'
                  )}
                ></div>
                <div className="max-[1550px]:gap-1.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1 max-[992px]:gap-0.5">
                  {provider.icon && (
                    <div className="max-[1550px]:size-5.5 relative flex size-6 items-center justify-center max-[1350px]:size-5 max-[1250px]:size-4 max-[992px]:size-3">
                      <Image
                        src={provider.icon}
                        alt={provider.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="whitespace-nowrap text-lg font-medium max-[1550px]:text-base max-[1350px]:text-sm max-[1250px]:text-xs max-[992px]:text-[10px]">
                    {provider.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {provider.action.label &&
                  (provider.name === 'Deploy Now' ? (
                    <div
                      className="max-[1550px]:py-0.75 max-[992px]:py-0.25 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-black max-[1550px]:px-2.5 max-[1550px]:text-sm max-[1350px]:px-2 max-[1350px]:py-0.5 max-[1350px]:text-xs max-[1250px]:rounded-[3px] max-[1250px]:px-1.5 max-[1250px]:py-0.5 max-[1250px]:text-[10px] max-[992px]:rounded-[2px] max-[992px]:px-1 max-[992px]:text-[8px]"
                      style={{
                        background:
                          'linear-gradient(to right, #bef264, #22c55e)',
                      }}
                    >
                      {provider.action.label}
                    </div>
                  ) : (
                    <span className="whitespace-nowrap text-sm max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[8px]">
                      {provider.action.label}
                    </span>
                  ))}
              </div>
            </div>

            {provider.action.description && (
              <div className="flex flex-col gap-1">
                {provider.action.description.map((description) => (
                  <span className="text-muted-foreground max-[1550px]:text-base max-[1350px]:text-sm max-[1250px]:text-xs max-[992px]:text-[10px]">
                    {description}
                  </span>
                ))}
              </div>
            )}

            {provider.comingSoon && (
              <div className="absolute left-0 top-0 rounded-br-md rounded-tl-md bg-green-500 px-2 py-0.5 text-[10px] font-medium text-white max-[1550px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">
                Coming soon
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-x-4 max-[1550px]:gap-x-3.5 max-[1350px]:gap-x-3 max-[1250px]:gap-x-2 max-[992px]:gap-x-1.5">
                <div className="max-[1550px]:gap-0.75 max-[992px]:gap-0.25 flex items-center gap-1 max-[1250px]:gap-0.5">
                  {provider.isDecentralized ? (
                    <Check className="size-4 text-green-500 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2" />
                  ) : (
                    <X className="size-4 text-red-500 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2" />
                  )}
                  <span className="text-sm text-gray-400 max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px]">
                    Decentralized
                  </span>
                </div>

                <div className="max-[1550px]:gap-0.75 max-[992px]:gap-0.25 flex items-center gap-1 max-[1250px]:gap-0.5">
                  <Check className="size-4 text-green-500 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2" />
                  <span className="text-sm text-gray-400 max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px]">
                    Web3 Ready
                  </span>
                </div>

                <div className="max-[1550px]:gap-0.75 max-[992px]:gap-0.25 flex items-center gap-1 max-[1250px]:gap-0.5">
                  {provider.features.includes('No KYC') ? (
                    <Check className="size-4 text-green-500 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2" />
                  ) : (
                    <X className="size-4 text-red-500 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2" />
                  )}
                  <span className="text-sm text-gray-400 max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px]">
                    No KYC
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex w-full flex-col place-items-center gap-1 pb-2 text-center text-sm text-muted-foreground max-[1250px]:text-xs">
          <span>Not happy? Scan for more!</span>
          <div>
            <Button
              className="flex gap-2"
              onClick={() => setShowExtendedOptions(true)}
            >
              <span>SkyScanner for Compute & GPUs</span>
              <Search />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showExtendedOptions} onOpenChange={setShowExtendedOptions}>
        <DialogContent className="max-w-[1200px]">
          <DeploymentProvider
            onSelect={(selectedProvider) => {
              setShowExtendedOptions(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {paidProvider && (
        <PaidProviderDialog
          paidProvider={paidProvider}
          close={(select) => {
            refetchMyServers()
            setPaidProvider(undefined)
            if (select !== undefined) {
              onSelect(select)
            }
          }}
        />
      )}
    </>
  )
}

function PaidProviderDialog({
  paidProvider,
  close,
}: {
  paidProvider: string
  close: (select?: ProviderReturn) => void
}) {
  const { address } = useAccount()
  const { data: total_credits, refetch: refetchCredits } = useQuery({
    queryKey: ['total_credits', address ?? ''],
    enabled: !!address,
    queryFn: async () => {
      if (!address) {
        return undefined
      }

      return axios
        .get(`https://indexer.core.openxai.org/api/${address}/total_credits`)
        .then((res) => res.data as number)
    },
  })

  const price = useMemo(() => {
    switch (paidProvider) {
      case 'Deploy Now':
        return 10_000_000 * 1000
      default:
        return 1_000_000_000_000_000
    }
  }, [paidProvider])

  const { toast } = useToast()
  const { signMessageAsync } = useSignMessage()
  const [deploying, setDeploying] = useState<boolean>(false)

  if (total_credits === undefined) {
    return <></>
  }

  if (total_credits < price) {
    return (
      <CreditsPayment
        item="OpenxAI's Dedicated Tokenized GPU"
        price={price}
        close={(success) => {
          if (success) {
            refetchCredits()
          } else {
            close()
          }
        }}
      />
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
    >
      {deploying ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploying Tokenized Server</DialogTitle>
            <DialogDescription className="flex place-items-center gap-1">
              <Hourglass />
              <span>
                Please wait, this can take up to a minute. Do not refresh the
                page.
              </span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mint OpenxAI&apos;s Dedicated Tokenized GPU
            </DialogTitle>
            {total_credits !== undefined && (
              <DialogDescription>
                You have {total_credits / 1_000_000} / {price / 1_000_000} GPU
                credits
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="flex gap-1 text-green-600">
              <CheckCircle2 />
              <span>You have enough GPU credits</span>
            </div>
            <Button
              onClick={() => {
                toast({
                  title: 'Please confirm in your wallet',
                  description:
                    'Signing the message is used as confirmation to spend your credits.',
                })

                signMessageAsync({
                  account: address,
                  message: `Mint new ownaiv1@base to ${address}`,
                })
                  .then((signature) => {
                    setDeploying(true)
                    axios
                      .post(
                        'https://indexer.core.openxai.org/api/ownaiv1/base/mint',
                        {
                          to: address,
                          payer_address: address,
                          payer_signature: signature,
                        }
                      )
                      .then((res) => res.data as number)
                      .then((tokenId) => {
                        close({
                          type: 'xnode',
                          collection: 'ownaiv1',
                          chain: 'base',
                          tokenId: tokenId.toString(),
                        })
                      })
                      .finally(() => setDeploying(false))
                  })
                  .catch(console.error)
              }}
            >
              Deploy Now
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
