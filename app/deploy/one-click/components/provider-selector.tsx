'use client'

import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import DeploymentProvider from "../../deployment-provider"
import { useState } from 'react'
import Image from 'next/image'

type Provider = {
  name: string
  icon?: string
  features: string[]
  action: {
    label: string
    price?: string
  }
  disabled?: boolean
  comingSoon?: boolean
  isDecentralized?: boolean
}

interface ProviderSelectorProps {
  selected?: Provider
  showAll?: boolean
  onSelect: (provider: Provider) => void
}

export function ProviderSelector({ selected, showAll, onSelect }: ProviderSelectorProps) {
  const [showExtendedOptions, setShowExtendedOptions] = useState(false)

  const providers: Provider[] = [
    {
      name: 'Xnode',
      icon: '/images/xnode-logo/xnode-cube.png',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: 'Try for Free' },
      isDecentralized: true
    },
    {
      name: 'Xnode DVM',
      icon: '/images/xnode-card/silvercard-front.webp',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '500 OPENX' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'Vultr (Washington)',
      icon: '/images/providers/vultr.svg',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$655p/m' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'AWS EC2 (HK)',
      icon: '/images/cloudLogo/aws.png',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$1,321p/m' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'Google Cloud (NYC)',
      icon: '/images/cloudLogo/google-cloud.png',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$1,745p/m' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'Xnode One (Hardware)',
      icon: '/images/xnode-one/back.png',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$0p/m' },
      disabled: true,
      comingSoon: true,
      isDecentralized: true
    }
  ]

  const displayProviders = showAll ? providers : (selected ? [...providers.filter(p => p.name === selected.name)] : providers)

  return (
    <>
      <div className="space-y-3 max-[1250px]:space-y-2">
        {displayProviders.map((provider) => (
          <div
            key={provider.name}
            onClick={() => !provider.disabled && onSelect(provider)}
            className={cn(
              "relative flex cursor-pointer flex-col rounded-lg border p-6 max-[1550px]:p-4 max-[1350px]:p-3 max-[1250px]:p-2 max-[992px]:p-1.5",
              "h-[128px] max-[1550px]:h-[120px] max-[1350px]:h-[115px] max-[1250px]:h-[110px] max-[992px]:h-[100px]",
              selected?.name === provider.name && "border-primary bg-primary/5",
              provider.disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div className={cn(
              "mb-6 max-[1550px]:mb-4 max-[1350px]:mb-3 max-[1250px]:mb-2 max-[992px]:mb-1 flex items-center justify-between"
            )}>
              <div className="flex items-center gap-3 max-[1550px]:gap-2.5 max-[1350px]:gap-2 max-[1250px]:gap-1.5 max-[992px]:gap-1">
                <div className={cn(
                  "size-3 max-[1550px]:size-2.75 max-[1350px]:size-2.5 max-[1250px]:size-2 max-[992px]:size-1.5 rounded-full",
                  selected?.name === provider.name ? "bg-primary" : "border border-muted-foreground"
                )}></div>
                <div className="flex items-center gap-2 max-[1550px]:gap-1.75 max-[1350px]:gap-1.5 max-[1250px]:gap-1 max-[992px]:gap-0.5">
                  {provider.icon && (
                    <div className="relative flex size-6 max-[1550px]:size-5.5 max-[1350px]:size-5 max-[1250px]:size-4 max-[992px]:size-3 items-center justify-center">
                      <Image 
                        src={provider.icon} 
                        alt={provider.name} 
                        width={24} 
                        height={24} 
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="text-lg max-[1550px]:text-base max-[1350px]:text-sm max-[1250px]:text-xs max-[992px]:text-[10px] font-medium whitespace-nowrap">{provider.name}</div>
                </div>
              </div>
              <div className="text-right">
                {provider.name === 'Xnode' ? (
                  <div className="inline-flex overflow-hidden rounded-md max-[1250px]:rounded-[3px] max-[992px]:rounded-[2px]">
                    <div style={{ 
                      padding: '1px', 
                      background: 'linear-gradient(to right, #ef4444, #eab308)'
                    }}>
                      <div className="rounded-[0.3rem] max-[1250px]:rounded-[0.2rem] max-[992px]:rounded-[0.15rem] bg-white px-3 max-[1550px]:px-2.5 max-[1350px]:px-2 max-[1250px]:px-1.5 max-[992px]:px-1 py-1 max-[1550px]:py-0.75 max-[1350px]:py-0.5 max-[1250px]:py-0.5 max-[992px]:py-0.25 dark:bg-black">
                        <span className="font-medium text-sm max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[8px] text-green-500 whitespace-nowrap">{provider.action.label}</span>
                      </div>
                    </div>
                  </div>
                ) : provider.name === 'Xnode DVM' ? (
                  <div className="rounded-md max-[1250px]:rounded-[3px] max-[992px]:rounded-[2px] px-3 max-[1550px]:px-2.5 max-[1350px]:px-2 max-[1250px]:px-1.5 max-[992px]:px-1 py-1 max-[1550px]:py-0.75 max-[1350px]:py-0.5 max-[1250px]:py-0.5 max-[992px]:py-0.25 font-medium text-sm max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[8px] text-black whitespace-nowrap" style={{ background: 'linear-gradient(to right, #bef264, #22c55e)' }}>
                    {provider.action.label}
                  </div>
                ) : (
                  <span className="text-sm max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[8px] whitespace-nowrap">{provider.action.label}</span>
                )}
              </div>
            </div>
            
            {provider.comingSoon && (
              <div className="absolute left-0 top-0 rounded-br-md rounded-tl-md bg-green-500 px-2 py-0.5 text-[10px] max-[1550px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px] font-medium text-white">
                Coming soon
              </div>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-x-4 max-[1550px]:gap-x-3.5 max-[1350px]:gap-x-3 max-[1250px]:gap-x-2 max-[992px]:gap-x-1.5">
                <div className="flex items-center gap-1 max-[1550px]:gap-0.75 max-[1250px]:gap-0.5 max-[992px]:gap-0.25">
                  {provider.isDecentralized ? (
                    <Check className="size-4 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2 text-green-500" />
                  ) : (
                    <X className="size-4 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2 text-red-500" />
                  )}
                  <span className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px] text-gray-400">Decentralized</span>
                </div>
                
                <div className="flex items-center gap-1 max-[1550px]:gap-0.75 max-[1250px]:gap-0.5 max-[992px]:gap-0.25">
                  <Check className="size-4 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2 text-green-500" />
                  <span className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px] text-gray-400">Web3 Ready</span>
                </div>
                
                <div className="flex items-center gap-1 max-[1550px]:gap-0.75 max-[1250px]:gap-0.5 max-[992px]:gap-0.25">
                  {provider.features.includes('No KYC') ? (
                    <Check className="size-4 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2 text-green-500" />
                  ) : (
                    <X className="size-4 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2 text-red-500" />
                  )}
                  <span className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px] text-gray-400">No KYC</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button 
          onClick={() => setShowExtendedOptions(true)} 
          className="w-full text-center text-sm max-[1250px]:text-xs text-muted-foreground underline"
        >
          View more options
        </button>
      </div>

      <Dialog open={showExtendedOptions} onOpenChange={setShowExtendedOptions}>
        <DialogContent className="max-w-[1200px]">
          <DeploymentProvider 
            onSelect={(selectedProvider) => {
              if (selectedProvider) {
                onSelect({
                  name: selectedProvider.productName,
                  features: ['Web3 Ready', 'No KYC'],
                  action: { 
                    label: `$${selectedProvider.price.monthly}p/m`,
                    price: `$${selectedProvider.price.monthly}`
                  },
                  isDecentralized: false
                })
              }
              setShowExtendedOptions(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}