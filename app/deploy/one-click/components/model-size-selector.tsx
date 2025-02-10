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
  showAll?: boolean
  onSelect: (size: ModelSize) => void
}

export function ModelSizeSelector({ selected, showAll, onSelect }: ModelSizeSelectorProps) {
  const sizes: ModelSize[] = [
        {
          "name": "1.5b",
          "ram": "8GB",
          "storage": "10GB",
          "cpu": "2 cores",
          "size": "1.5B parameters"
        },
        {
          "name": "7b",
          "ram": "4GB",
          "storage": "10GB",
          "cpu": "2 cores",
          "size": "7B parameters"
        },
        {
          "name": "8b",
          "ram": "8GB",
          "storage": "10GB",
          "cpu": "2 cores",
          "size": "8B parameters"
        },
        {
          "name": "14b",
          "ram": "16GB",
          "storage": "20GB",
          "cpu": "4 cores",
          "size": "14B parameters"
        },
        {
          "name": "32b",
          "ram": "24GB",
          "storage": "40GB",
          "cpu": "4 cores",
          "size": "32B parameters"
        },
        {
          "name": "70b",
          "ram": "48GB",
          "storage": "100GB",
          "cpu": "8 cores",
          "size": "70B parameters"
        },
        {
          "name": "671b",
          "ram": "512GB",
          "storage": "700GB",
          "cpu": "64 cores",
          "size": "671B parameters"
        }
  ]

  const displaySizes = showAll ? sizes : (selected ? [...sizes.filter(s => s.name === selected.name)] : sizes)

  return (
    <div className="space-y-3">
      {displaySizes.map((size) => (
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