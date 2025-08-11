'use client'

import { cn } from '@/lib/utils'
import { Info, Fuel } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'

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
  const [openTooltips, setOpenTooltips] = useState<Record<string, boolean>>({})

  const toggleTooltip = (id: string, isOpen: boolean) => {
    setOpenTooltips(prev => ({
      ...prev,
      [id]: isOpen
    }))
  }

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
    <div className="space-y-3 max-[1550px]:space-y-2.5 max-[1350px]:space-y-2 max-[1250px]:space-y-1.5">
      {displayOptions.map((option) => (
        <div
          key={option.id}
          onClick={() => onSelect(option)}
          className={cn(
            "relative flex h-[128px] cursor-pointer items-start justify-between rounded-lg border p-6 hover:border-primary/50 max-[1550px]:h-[120px] max-[1550px]:p-5 max-[1350px]:h-[115px] max-[1350px]:p-4 max-[1250px]:h-[105px] max-[1250px]:p-3 max-[992px]:h-[95px] max-[992px]:p-2",
            selected?.id === option.id && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3 max-[1550px]:gap-2.5 max-[1350px]:gap-2 max-[1250px]:gap-1.5 max-[992px]:gap-1">
            <div className={cn(
              "max-[1550px]:size-2.75 size-3 shrink-0 rounded-full max-[1350px]:size-2.5 max-[1250px]:size-2 max-[992px]:size-1.5",
              selected?.id === option.id ? "bg-primary" : "border border-muted-foreground"
            )}></div>
            <div className="flex flex-col pr-20 max-[1550px]:pr-16 max-[1350px]:pr-12 max-[1250px]:pr-8 max-[992px]:pr-4">
              <div className="max-[992px]:mb-0.25 mb-1 flex items-center gap-2 max-[1550px]:gap-1.5 max-[1350px]:gap-1 max-[1250px]:mb-0.5 max-[1250px]:gap-0.5">
                <div className="text-base font-medium max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[9px]">{option.title}</div>
              </div>
              <div className="text-sm text-muted-foreground max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px]">{option.description}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            {option.tooltip && (
              <TooltipProvider>
                <Tooltip 
                  open={openTooltips[option.id]} 
                  onOpenChange={(open) => toggleTooltip(option.id, open)}
                >
                  <TooltipTrigger asChild>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        toggleTooltip(option.id, !openTooltips[option.id]);
                      }}
                      className="relative z-10 cursor-pointer p-1 max-[1250px]:p-0.5"
                    >
                      <Info className="max-[1550px]:size-4.5 size-5 text-gray-400 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="z-50">
                    <p className="text-sm max-[1550px]:text-xs max-[1250px]:text-[10px]">{option.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {option.price && (
            <div className="absolute bottom-6 right-6 flex items-center gap-1 text-gray-400 max-[1550px]:bottom-5 max-[1550px]:right-5 max-[1350px]:bottom-4 max-[1350px]:right-4 max-[1250px]:bottom-3 max-[1250px]:right-3 max-[1250px]:gap-0.5 max-[992px]:bottom-2 max-[992px]:right-2">
              <Fuel className="max-[1550px]:size-4.5 size-5 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3" />
              <span className="text-base max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[9px]">{option.price}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}