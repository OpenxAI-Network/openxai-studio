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
      name: 'Xnode (Decentralized)',
      icon: '/icons/xnode-logo.svg',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: 'Try for Free' },
      isDecentralized: true
    },
    {
      name: 'Xnode DVM (Decentralized)',
      icon: '/icons/xnode-dvm.svg',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '500 OPENX' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'Vultr (Washington)',
      icon: '/icons/vultr-logo.svg',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$655p/m' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'AWS EC2 (HK)',
      icon: '/icons/aws-logo.svg',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$1,321p/m' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'Google Cloud (NYC)',
      icon: '/icons/google-cloud-logo.svg',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$1,745p/m' },
      disabled: true,
      isDecentralized: false
    },
    {
      name: 'Xnode One (Hardware)',
      icon: '/icons/xnode-one.svg',
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
              "relative flex flex-col rounded-lg border p-4 hover:border-primary/50",
              selected?.name === provider.name && "border-primary bg-primary/5",
              provider.disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  selected?.name === provider.name ? "bg-primary" : "border border-muted-foreground"
                )}></div>
                <div className="flex items-center gap-2">
                  {provider.icon && (
                    <div className="w-6 h-6 relative">
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
                {provider.action.label}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1">
                  {provider.isDecentralized ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-400">Decentralized</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-400">Web3 Ready</span>
                </div>
                <div className="flex items-center gap-1">
                  {provider.features.includes('No KYC') ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-400">No KYC</span>
                </div>
              </div>
              
              {provider.comingSoon && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Coming soon
                </div>
              )}
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