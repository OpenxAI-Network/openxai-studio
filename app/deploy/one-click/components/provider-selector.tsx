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
      <div className="space-y-3">
        {displayProviders.map((provider) => (
          <div
            key={provider.name}
            onClick={() => !provider.disabled && onSelect(provider)}
            className={cn(
              "relative flex h-[128px] cursor-pointer flex-col rounded-lg border p-6 hover:border-primary/50",
              selected?.name === provider.name && "border-primary bg-primary/5",
              provider.disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-3 rounded-full",
                  selected?.name === provider.name ? "bg-primary" : "border border-muted-foreground"
                )}></div>
                <div className="flex items-center gap-2">
                  {provider.icon && (
                    <div className="relative flex size-6 items-center justify-center">
                      <Image 
                        src={provider.icon} 
                        alt={provider.name} 
                        width={24} 
                        height={24} 
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="text-lg font-medium">{provider.name}</div>
                </div>
              </div>
              <div className="text-right">
                {provider.name === 'Xnode' ? (
                  <div className="inline-flex overflow-hidden rounded-md">
                    <div style={{ 
                      padding: '1px', 
                      background: 'linear-gradient(to right, #ef4444, #eab308)'
                    }}>
                      <div className="rounded-[0.3rem] bg-white px-3 py-1 dark:bg-black">
                        <span className="font-medium text-green-500">{provider.action.label}</span>
                      </div>
                    </div>
                  </div>
                ) : provider.name === 'Xnode DVM' ? (
                  <div className="rounded-md px-3 py-1 font-medium text-black" style={{ background: 'linear-gradient(to right, #bef264, #22c55e)' }}>
                    {provider.action.label}
                  </div>
                ) : (
                  <span>{provider.action.label}</span>
                )}
              </div>
            </div>
            
            {provider.comingSoon && (
              <div className="absolute left-0 top-0 rounded-br-md rounded-tl-md bg-green-500 px-2 py-1 text-[10px] font-medium text-white">
                Coming soon
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1">
                  {provider.isDecentralized ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <X className="size-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-400">Decentralized</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-green-500" />
                  <span className="text-sm text-gray-400">Web3 Ready</span>
                </div>
                <div className="flex items-center gap-1">
                  {provider.features.includes('No KYC') ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <X className="size-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-400">No KYC</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button 
          onClick={() => setShowExtendedOptions(true)} 
          className="w-full text-center text-sm text-muted-foreground underline"
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