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
              "flex h-[128px] cursor-pointer flex-col rounded-lg border p-6 hover:border-primary/50",
              isAvailable 
                ? "border-border"
                : "cursor-not-allowed opacity-50",
              selected?.name === size.name && "border-primary bg-primary/5"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-3 rounded-full",
                  selected?.name === size.name ? "bg-primary" : "border border-muted-foreground"
                )}></div>
                <div className="text-lg font-medium">{size.name}</div>
              </div>
              <div className="text-right text-lg font-medium">
                {modelDefinition.name}
              </div>
            </div>
            
            <div className="flex justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="shrink-0 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="7" y1="2" x2="7" y2="22"></line>
                    <line x1="17" y1="2" x2="17" y2="22"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="2" y1="7" x2="7" y2="7"></line>
                    <line x1="2" y1="17" x2="7" y2="17"></line>
                    <line x1="17" y1="17" x2="22" y2="17"></line>
                    <line x1="17" y1="7" x2="22" y2="7"></line>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-400">RAM</div>
                  <div className="text-sm">{size.ram}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="shrink-0 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5z"></path>
                    <path d="M8 10h8"></path>
                    <path d="M8 14h8"></path>
                    <path d="M8 18h8"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Storage</div>
                  <div className="text-sm">{size.storage} SSD</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="shrink-0 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                    <rect x="9" y="9" width="6" height="6"></rect>
                    <line x1="9" y1="2" x2="9" y2="4"></line>
                    <line x1="15" y1="2" x2="15" y2="4"></line>
                    <line x1="9" y1="20" x2="9" y2="22"></line>
                    <line x1="15" y1="20" x2="15" y2="22"></line>
                    <line x1="20" y1="9" x2="22" y2="9"></line>
                    <line x1="20" y1="14" x2="22" y2="14"></line>
                    <line x1="2" y1="9" x2="4" y2="9"></line>
                    <line x1="2" y1="14" x2="4" y2="14"></line>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-400">CPU</div>
                  <div className="text-sm">{size.cpu}</div>
                </div>
              </div>
            </div>
          </div>
        )})}
    </div>
  )
}