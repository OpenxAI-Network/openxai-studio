'use client'

import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import DeploymentProvider from "../../deployment-provider"
import { useState } from 'react'
import { useDeploymentContext } from '../../deployment-context'

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
      name: 'Xnode (Decentralized)',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: 'Try for Free' }
    },
    {
      name: 'Xnode DVM (Decentralized)',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '500 OPENX' },
      disabled: true
    },
    {
      name: 'Hivelocity (Decentralized)',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$15p/m' },
      disabled: true
    },
    {
      name: 'AWS EC2 (HK)',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$421p/m' },
      disabled: true
    },
    {
      name: 'Google Cloud (NYC)',
      features: ['Web3 Ready', 'No KYC'],
      action: { label: '$745p/m' },
      disabled: true
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
            <div className="font-medium mb-3 w-full">{provider.name}</div>
            
            <div className="grid grid-cols-3 w-full items-center">
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Web3 Ready</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">No KYC</span>
              </div>
              <div className="text-sm text-right">
                {provider.action.label}
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
            onSelect={() => {
              if (provider) {
                onSelect({
                  name: provider.productName,
                  features: ['Decentralized', 'Web3 Ready', 'No KYC'],
                  action: { 
                    label: `$${provider.price.monthly}p/m`,
                    price: `$${provider.price.monthly}`
                  }
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