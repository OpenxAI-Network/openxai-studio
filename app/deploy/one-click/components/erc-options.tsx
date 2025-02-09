'use client'

import { cn } from '@/lib/utils'

type ERCOption = {
  id: string
  title: string
  description: string
  price?: string
}

interface ERCOptionsProps {
  selected?: ERCOption
  showAll?: boolean
  onSelect: (option: ERCOption) => void
}

export function ERCOptions({ selected, showAll, onSelect }: ERCOptionsProps) {
  const options: ERCOption[] = [
    {
      id: 'erc-4337',
      title: 'ERC-4337 (Service Subscription)',
      description: 'Pay-as-you-go service subscription',
      price: '0.021Ξ'
    },
    {
      id: 'erc-721',
      title: 'ERC-721 - Model Ownership',
      description: 'Full ownership and licensing control over AI models',
      price: '0.021Ξ'
    },
    {
      id: 'erc-1155',
      title: 'ERC-1155 - Fractionalized',
      description: 'Fractionalized AI Datasets (contributors to retain rights)',
      price: '0.021Ξ'
    }
  ]

  const displayOptions = showAll ? options : (selected ? [...options.filter(o => o.id === selected.id)] : options)

  return (
    <div className="space-y-3">
      {displayOptions.map((option) => (
        <div
          key={option.id}
          onClick={() => onSelect(option)}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:border-primary/50",
            selected?.id === option.id && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="font-medium">{option.title}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
          </div>
          {option.price && <div className="text-sm">{option.price}</div>}
        </div>
      ))}
    </div>
  )
} 