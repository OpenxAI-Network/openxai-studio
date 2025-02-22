'use client'

import { cn } from '@/lib/utils'
import modelDefinitions from '@/utils/model-definitions.json'

interface ModelOption {
  name: string
  desc: string
  nixName: string
  type: string
  requirements: {
    [key: string]: {
      ram: number
      storage: number
      cpu: number
      ollamaCommand: string
    }
  }
  value?: string
}

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
  hardware?: {
    memoryGB: number
    storageGB: number
    cpuCores: number
  }
  onSelect: (size: ModelSize) => void
}

export function ModelSizeSelector({ selected, showAll, hardware, onSelect }: ModelSizeSelectorProps) {
  const deepseekModel = modelDefinitions.find(m => m.name === 'deepseek-r1')
  const modelOption = deepseekModel?.options[0] as ModelOption
  
  const modelSizes = modelOption?.requirements || {}
  const sizes = Object.entries(modelSizes).map(([name, specs]) => ({
    name,
    ram: `${specs.ram / 1000}GB`,
    storage: `${specs.storage / 1000}GB`,
    cpu: `${specs.cpu} cores`,
    size: `${name} parameters`,
    ollamaCommand: specs.ollamaCommand
  }))

  const availableSizes = hardware 
    ? sizes.filter(size => {
        const specs = modelSizes[size.name]
        return specs.ram <= hardware.memoryGB * 1000 && 
               specs.storage <= hardware.storageGB * 1000 &&
               specs.cpu <= hardware.cpuCores
      })
    : sizes

  const displaySizes = showAll ? availableSizes : (selected ? [...availableSizes.filter(s => s.name === selected.name)] : availableSizes)

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