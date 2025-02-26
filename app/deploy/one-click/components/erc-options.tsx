'use client'

import { cn } from '@/lib/utils'
import { Info, Fuel } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ERCOption = {
  id: string
  title: string
  description: string
  price?: string
  tooltip?: string
}

interface ERCOptionsProps {
  selected?: ERCOption
  showAll?: boolean
  onSelect: (option: ERCOption) => void
}

export function ERCOptions({ selected, showAll, onSelect }: ERCOptionsProps) {
  const options: ERCOption[] = [
    {
      id: 'decide-later',
      title: 'Decide Later',
      description: 'Setup monetization model after deployment'
    },
    {
      id: 'erc-4337',
      title: 'ERC-4337 - Service Subscription',
      description: 'Earn ongoing royalties (licensed, rented, or resold)',
      price: '0.021Ξ',
      tooltip: 'Account abstraction standard for smart contract wallets'
    },
    {
      id: 'erc-721',
      title: 'ERC-721 - Model Ownership',
      description: 'Full ownership and licensing control over AI models',
      price: '0.021Ξ',
      tooltip: 'Non-fungible token standard for unique digital assets'
    },
    {
      id: 'erc-1155',
      title: 'ERC-1155 - Fractionalized',
      description: 'Fractionalized AI Datasets (contributors to retain rights)',
      price: '0.021Ξ',
      tooltip: 'Multi-token standard supporting both fungible and non-fungible tokens'
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
            "relative flex h-[128px] cursor-pointer items-start justify-between rounded-lg border p-6 hover:border-primary/50",
            selected?.id === option.id && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-3 shrink-0 rounded-full",
              selected?.id === option.id ? "bg-primary" : "border border-muted-foreground"
            )}></div>
            <div className="flex flex-col pr-20">
              <div className="flex items-center gap-2">
                <div className="font-medium">{option.title}</div>
              </div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            {option.tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{option.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {option.price && (
            <div className="absolute bottom-6 right-6 flex items-center gap-1 text-gray-400">
              <Fuel className="size-5" />
              <span className="text-base">{option.price}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}