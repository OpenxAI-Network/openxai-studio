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
  onSelect: (option: ERCOption) => void
}

export function ERCOptions({ selected, onSelect }: ERCOptionsProps) {
  const options: ERCOption[] = [
    {
      id: 'erc-4337',
      title: 'ERC-4337 (Service Subscription)',
      description: 'Pay-as-you-go service subscription',
      price: '0.021Ξ'
    },
    // Add other ERC options...
  ]

  return (
    <div className="space-y-3">
      {options.map((option) => (
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
            {selected?.id === option.id}
          </div>
          {option.price && <div className="text-sm">{option.price}</div>}
        </div>
      ))}
    </div>
  )
} 