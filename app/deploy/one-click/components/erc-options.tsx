'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Fuel } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ERCOption = {
  id: string
  title: string
  standard?: string
  advantages?: string[]
  description?: string
  price?: string
}

interface ERCOptionsProps {
  selected?: ERCOption
  showAll?: boolean
  onSelect: (option: ERCOption) => void
}

export function ERCOptions({ selected, showAll, onSelect }: ERCOptionsProps) {
  const [openTooltips, setOpenTooltips] = useState<Record<string, boolean>>({})

  const toggleTooltip = (id: string, isOpen: boolean) => {
    setOpenTooltips((prev) => ({
      ...prev,
      [id]: isOpen,
    }))
  }

  const options: ERCOption[] = [
    {
      id: 'decide-later',
      title: 'Decide Later',
      description: 'Setup monetization model after deployment',
    },
    {
      id: 'single-owner',
      title: 'Full Transfer (Sell Entire App, Data & Infra)',
      standard: 'ERC-721',
      advantages: [
        'Transfer full ownership of your AI model, data, infra, and running service as a single asset.',
        'Buyer gains complete control, you fully exit.',
      ],
      price: '$0.0005',
    },
    {
      id: 'saas',
      title: 'On-Chain SaaS (Subscriptions & Royalties)',
      standard: 'ERC-6551 + ERC-4337',
      advantages: [
        'Turn your AI into a SaaS without banks/credit cards.',
        'Use smart contracts for subscriptions, licensing, or rentals.',
        'Earn ongoing revenue and royalties automatically.',
      ],
      price: '$0.0005',
    },
  ]

  const displayOptions = showAll
    ? options
    : selected
      ? [...options.filter((o) => o.id === selected.id)]
      : options

  return (
    <div className="space-y-3 max-[1550px]:space-y-2.5 max-[1350px]:space-y-2 max-[1250px]:space-y-1.5">
      {displayOptions.map((option) => (
        <div
          key={option.id}
          onClick={() => {
            if (option.id !== 'decide-later') {
              return
            }

            onSelect(option)
          }}
          className={cn(
            'relative flex cursor-pointer items-start justify-between rounded-lg border p-6 hover:border-primary/50 max-[1550px]:p-5 max-[1350px]:p-4 max-[1250px]:p-3 max-[992px]:p-2',
            selected?.id === option.id && 'border-primary bg-primary/5',
            option.id !== 'decide-later' && 'cursor-not-allowed bg-muted'
          )}
        >
          <div className="flex items-center gap-3 max-[1550px]:gap-2.5 max-[1350px]:gap-2 max-[1250px]:gap-1.5 max-[992px]:gap-1">
            <div
              className={cn(
                'max-[1550px]:size-2.75 size-3 shrink-0 rounded-full max-[1350px]:size-2.5 max-[1250px]:size-2 max-[992px]:size-1.5',
                selected?.id === option.id
                  ? 'bg-primary'
                  : 'border border-muted-foreground'
              )}
            ></div>
            <div className="flex flex-col">
              <div className="max-[992px]:mb-0.25 mb-1 flex items-center gap-2 max-[1550px]:gap-1.5 max-[1350px]:gap-1 max-[1250px]:mb-0.5 max-[1250px]:gap-0.5">
                <div className="flex place-content-between text-base font-medium max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[9px]">
                  <span>{option.title}</span>
                  {option.id !== 'decide-later' && (
                    <Button variant="outline">preview</Button>
                  )}
                </div>
              </div>
              {option.standard && (
                <div className="flex gap-2 text-sm text-muted-foreground max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px]">
                  <Image
                    src="/images/viewDeployment/ollama.svg"
                    alt="Base icon"
                    width={16}
                    height={16}
                  />
                  {option.standard}
                </div>
              )}
              <div className="flex flex-col gap-1 text-sm text-muted-foreground max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[8px]">
                {option.description ??
                  option.advantages?.map((advantage) => (
                    <span>{advantage}</span>
                  ))}
              </div>

              {option.price && (
                <div className="flex items-center justify-end gap-1 pt-1 text-gray-400 max-[1550px]:bottom-5 max-[1550px]:right-5 max-[1350px]:bottom-4 max-[1350px]:right-4 max-[1250px]:bottom-3 max-[1250px]:right-3 max-[1250px]:gap-0.5 max-[992px]:bottom-2 max-[992px]:right-2">
                  <Fuel className="max-[1550px]:size-4.5 size-5 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3" />
                  <span className="text-base max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[10px] max-[992px]:text-[9px]">
                    {option.price}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
