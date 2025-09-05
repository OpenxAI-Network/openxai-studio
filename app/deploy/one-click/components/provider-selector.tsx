'use client'

import { useMemo, useState,useRef,useEffect,useCallback } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import axios from 'axios'
import { Check, CheckCircle2, Hourglass, Search, X } from 'lucide-react'
import { useAccount, useSignMessage } from 'wagmi'
import Lottie,{ type LottieRefCurrentProps } from 'lottie-react'
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
          name: `Tokenized GPU ${server.token_id}`,
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
        description: [
          "OpenxAI's Tokenized GPUs | Dedicated",
          'Stake & earn up to 330% APY',
        ],
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
              <div className="flex flex-col gap-6">
                {provider.action.description.map((description, i) =>
                  i === 0 ? (
                    <span className="text-muted-foreground max-[1550px]:text-base max-[1350px]:text-sm max-[1250px]:text-xs max-[992px]:text-[10px]">
                      {description}
                    </span>
                  ) : (
                    <div>
                      <span className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-black/60 max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[8px]">
                        {description}
                      </span>
                    </div>
                  )
                )}
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

  const { data: price } = useQuery({
    queryKey: ['ownaiv1_price'],
    queryFn: async () => {
      return await axios
        .get('https://indexer.core.openxai.org/api/ownaiv1/base/price')
        .then((res) => res.data as number)
    },
  })

  const { toast } = useToast()
  const { signMessageAsync } = useSignMessage()
  const videoRef = useRef<HTMLVideoElement>(null)
 
  const [deploying, setDeploying] = useState<boolean>(false)
  const [shouldRender, setShouldRender] = useState(deploying)
  const [loop, setLoop] = useState(true)
  const [fastForward, setFastForward] = useState(false)
 

  const applySpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const forceSpeedApplication = useCallback((speed: number) => {
    setTimeout(() => {
      applySpeed(speed)
      setTimeout(() => applySpeed(speed), 100)
    }, 50)
  }, [])

  useEffect(() => {
    if (deploying) {
      setShouldRender(true)
      setLoop(true)
      setFastForward(false)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
      forceSpeedApplication(1)
    } else if (videoRef.current) {
      setLoop(false)
      setFastForward(true)
      forceSpeedApplication(16)
    }
  }, [deploying, forceSpeedApplication])

  useEffect(() => {
    if (shouldRender && videoRef.current) {
      const intervalId = setInterval(() => {
        if (deploying) {
          applySpeed(1)
        } else if (fastForward ) {
          applySpeed(16)
        }
      }, 100)

      return () => clearInterval(intervalId)
    }
  }, [shouldRender, deploying, fastForward])

  const handleVideoEnd = () => {
    if (!loop) {
      setShouldRender(false)
    }
  }

  const handleVideoLoaded = () => {
    if (deploying) {
      forceSpeedApplication(6)
    } else if (fastForward) {
      forceSpeedApplication(16)
    }
  }

  if (total_credits === undefined || price === undefined) {
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
      {shouldRender ? (
        // <DialogContent className="border-none w-full h-full">
        //   <DialogHeader>
        //     <DialogTitle>Deploying Tokenized Server</DialogTitle>
        //     <DialogDescription className="flex place-items-center gap-1">
        //       <Hourglass />
        //       <span>
        //         Please wait, this can take up to a minute. Do not refresh the
        //         page.
        //       </span>
        //     </DialogDescription>
        //   </DialogHeader> 
        // </DialogContent>
        <div className="fixed bg-black/80 backdrop-blur-sm w-full h-full inset-0 flex justify-center items-center z-[100]">
       {/* <Lottie
            lottieRef={lottieRef}
            animationData={flowAnimation}
            loop={loop}
            autoplay={true}
            onComplete={() => {
              setShouldRender(false)
            }}
            onLoopComplete={() => {
              
              if (deploying) {
                applySpeed(6)
              } else if (fastForward) {
                applySpeed(8)
              }
            }}
            onDOMLoaded={() => {
              
              if (deploying) {
                forceSpeedApplication(6)
              } else if (fastForward) {
                forceSpeedApplication(8)
              }
            }}
          /> */}
        <div className="flex size-4/5 items-center justify-center">
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            loop={loop}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            onLoadedMetadata={handleVideoLoaded}
          >
           
            <source src="/video/GPU-animation.webm" type="video/webm"/>
            
          
          </video>
        </div>
        
      </div>  
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
                // setDeploying(true)
                // setShouldRender(true)
                // setTimeout(()=>{setDeploying(false)},30000)
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
