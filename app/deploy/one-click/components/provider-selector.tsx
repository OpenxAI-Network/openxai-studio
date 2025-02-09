'use client'

import { cn } from '@/lib/utils'

type Provider = {
  name: string
  features: string[]
  action: {
    label: string
    price?: string
  }
}

interface ProviderSelectorProps {
  selected?: Provider
  showAll?: boolean
  onSelect: (provider: Provider) => void
}

export function ProviderSelector({ selected, showAll, onSelect }: ProviderSelectorProps) {
  const providers: Provider[] = [
    {
      name: 'Xnode DVM (Decentralized)',
      features: ['Free tier available', 'No KYC required', 'Instant deployment'],
      action: { label: 'Try for Free' }
    },
    {
      name: 'Bare Metal',
      features: ['High performance', 'Dedicated resources', 'Custom configuration'],
      action: { label: 'Select', price: '0.021Ξ' }
    }
  ]

  const displayProviders = showAll ? providers : (selected ? [...providers.filter(p => p.name === selected.name)] : providers)

  return (
    <div className="space-y-3">
      {displayProviders.map((provider) => (
        <div
          key={provider.name}
          onClick={() => onSelect(provider)}
          className={cn(
            "relative flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:border-primary/50",
            selected?.name === provider.name && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="font-medium">{provider.name}</div>
              <div className="text-sm text-muted-foreground">
                {provider.features.join(' • ')}
              </div>
            </div>
          </div>
          <div className="text-sm">
            {provider.action.price && <span className="mr-2">{provider.action.price}</span>}
            {provider.action.label}
          </div>
        </div>
      ))}
    </div>
  )
}