'use client'

import { cn } from '@/lib/utils'

type ModelSize = {
  name: string
  ram: string
  storage: string
  cpu: string
  size: string
}

interface ModelSizeSelectorProps {
  selected?: ModelSize
  onSelect: (size: ModelSize) => void
}

export function ModelSizeSelector({ selected, onSelect }: ModelSizeSelectorProps) {
  const sizes: ModelSize[] = [
    {
      name: '7b',
      ram: '1.5GB',
      storage: '4GB',
      cpu: '2 cores',
      size: '7B parameters'
    },
    {
      name: '20b',
      ram: '20GB',
      storage: '100GB',
      cpu: '4 cores',
      size: '20B parameters'
    },
    {
      name: '64b',
      ram: '1.5GB',
      storage: '4GB',
      cpu: '8 cores',
      size: '64B parameters'
    }
  ]

  return (
    <div className="space-y-3">
      {(selected ? [sizes.find(s => s.name === selected.name)] : sizes)
        .filter(Boolean)
        .map((size) => (
          <div
            key={size.name}
            onClick={() => onSelect(size)}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:border-primary/50",
              selected?.name === size.name && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="font-medium">{size.name}</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {size.ram} RAM • {size.storage} Storage
            </div>
          </div>
        ))}
    </div>
  )
} 