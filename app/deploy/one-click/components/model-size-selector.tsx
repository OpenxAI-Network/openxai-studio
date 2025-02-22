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

export function ModelSizeSelector({ selected, showAll, hardware, onSelect, templateId }: ModelSizeSelectorProps & { templateId?: string }) {
  // Find the correct model definition based on templateId
  const modelDefinition = modelDefinitions.find(m => m.nixName === templateId)
  if (!modelDefinition) {
    console.error(`Model definition not found for template: ${templateId}`)
    return null
  }
  
  const modelOption = modelDefinition.options[0] as ModelOption
  
  const modelSizes = modelOption?.requirements || {}
  const sizes = Object.entries(modelSizes).map(([name, specs]) => ({
    name,
    ram: `${specs.ram / 1000}GB`,
    storage: `${specs.storage / 1000}GB`,
    cpu: `${specs.cpu} cores`,
    size: `${name} parameters`,
    ollamaCommand: specs.ollamaCommand
  }))

  const displaySizes = showAll ? sizes : (selected ? [sizes.find(s => s.name === selected.name)!] : sizes)

  return (
    <div className="space-y-3">
      {displaySizes.map((size) => {
        const isAvailable = !hardware || (
          modelSizes[size.name].ram <= hardware.memoryGB * 1000 &&
          modelSizes[size.name].storage <= hardware.storageGB * 1000 &&
          modelSizes[size.name].cpu <= hardware.cpuCores
        )

        return (
          <div
            key={size.name}
            onClick={() => isAvailable && onSelect(size)}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:border-primary/50",
              isAvailable 
                ? "border-border"
                : "cursor-not-allowed opacity-50",
              selected?.name === size.name && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">{size.name}</div>
            </div>
            <div className="text-muted-foreground">
              {size.ram} RAM • {size.storage} Storage
            </div>
          </div>
        )})}
    </div>
  )
}