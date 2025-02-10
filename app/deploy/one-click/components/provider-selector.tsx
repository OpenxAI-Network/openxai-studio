'use client'

import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import DeploymentProvider from "../../deployment-provider"
import { useState } from 'react'

type Provider = {
  name: string
  features: string[]
  action: {
    label: string
    price?: string
  }
  disabled?: boolean
  comingSoon?: boolean
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
      name: 'Xnode (Decentrali..)',
      features: ['Decentralized', 'Web3 Ready', 'No KYC'],
      action: { label: 'Try for Free' }
    },
    {
      name: 'Xnode DVM (Decentrali..)',
      features: ['Decentralized', 'Web3 Ready', 'No KYC'],
      action: { label: '500 OPENX' }
    },
    {
      name: 'Hivelocity (Decentrali..)',
      features: ['Decentralized', 'Web3 Ready', 'No KYC'],
      action: { label: '$15p/m', price: '$15' }
    },
    {
      name: 'AWS EC2 (HK)',
      features: ['Decentralized', 'Web3 Ready', 'No KYC'],
      action: { label: '$421p/m', price: '$421' },
      disabled: true
    },
    {
      name: 'Google Cloud (NYC)',
      features: ['Decentralized', 'Web3 Ready', 'No KYC'],
      action: { label: '$745p/m', price: '$745' },
      disabled: true
    },
    {
      name: 'Xnode One (Decentrali..)',
      features: ['Decentralized', 'Web3 Ready', 'No KYC'],
      action: { label: '$0p/m', price: '$0' },
      comingSoon: true
    }
  ]

  const displayProviders = showAll ? providers : (selected ? [...providers.filter(p => p.name === selected.name)] : providers)

  return (
    <>
      <div className="space-y-3">
        {displayProviders.map((provider) => (
          <div
            key={provider.name}
            onClick={() => !provider.disabled && !provider.comingSoon && onSelect(provider)}
            className={cn(
              "relative flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:border-primary/50",
              selected?.name === provider.name && "border-primary bg-primary/5",
              (provider.disabled || provider.comingSoon) && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium">{provider.name}</div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {provider.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {feature === 'Decentralized' || feature === 'Web3 Ready' || feature === 'No KYC' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm">
              {provider.comingSoon && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">Coming soon</span>
              )}
              {!provider.comingSoon && provider.action.label}
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
            onSelect={(hardwareProduct) => {
              onSelect({
                name: hardwareProduct.productName,
                features: ['Decentralized', 'Web3 Ready', 'No KYC'],
                action: { 
                  label: `$${hardwareProduct.price.monthly}p/m`,
                  price: `$${hardwareProduct.price.monthly}`
                }
              })
              setShowExtendedOptions(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}