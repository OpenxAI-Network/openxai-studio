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
  templateId?: string
  onSelect: (size: ModelSize) => void
}

export function ModelSizeSelector({ selected, showAll, hardware, onSelect, templateId }: ModelSizeSelectorProps) {
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
    <div className="space-y-3 max-[1550px]:space-y-2.5 max-[1350px]:space-y-2 max-[1250px]:space-y-1.5 max-[992px]:space-y-1">
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
              "flex h-[128px] cursor-pointer flex-col rounded-lg border p-6 hover:border-primary/50 max-[1550px]:h-[120px] max-[1550px]:p-5 max-[1350px]:h-[112px] max-[1350px]:p-4 max-[1250px]:h-[100px] max-[1250px]:p-3 max-[992px]:h-[90px] max-[992px]:p-2",
              isAvailable 
                ? "border-border"
                : "cursor-not-allowed opacity-50",
              selected?.name === size.name && "border-primary bg-primary/5"
            )}
          >
            <div className="mb-4 flex items-center justify-between max-[1550px]:mb-3.5 max-[1350px]:mb-3 max-[1250px]:mb-2.5 max-[992px]:mb-2">
              <div className="flex items-center gap-3 max-[1550px]:gap-2.5 max-[1350px]:gap-2 max-[1250px]:gap-1.5 max-[992px]:gap-1">
                <div className={cn(
                  "size-3 rounded-full max-[1550px]:size-2.5 max-[1350px]:size-2 max-[1250px]:size-1.5 max-[992px]:size-1",
                  selected?.name === size.name ? "bg-primary" : "border border-muted-foreground"
                )}></div>
                <div className="text-lg font-medium max-[1550px]:text-base max-[1350px]:text-sm max-[1250px]:text-xs max-[992px]:text-[10px]">{size.name}</div>
              </div>
              <div className="text-right text-lg font-medium max-[1550px]:text-base max-[1350px]:text-sm max-[1250px]:text-xs max-[992px]:text-[10px]">
                {modelDefinition.name}
              </div>
            </div>
            
            <div className="flex justify-between gap-4 max-[1550px]:gap-3.5 max-[1350px]:gap-3 max-[1250px]:gap-2.5 max-[992px]:gap-2">
              <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                <div className="max-[1550px]:w-4.5 max-[1550px]:h-4.5 size-5 shrink-0 text-gray-400 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">RAM</div>
                  <div className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{size.ram}</div>
                </div>
              </div>
              
              <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                <div className="max-[1550px]:w-4.5 max-[1550px]:h-4.5 size-5 shrink-0 text-gray-400 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5z"></path>
                    <path d="M8 10h8"></path>
                    <path d="M8 14h8"></path>
                    <path d="M8 18h8"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">Storage</div>
                  <div className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{size.storage} SSD</div>
                </div>
              </div>
              
              <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                <div className="max-[1550px]:w-4.5 max-[1550px]:h-4.5 size-5 shrink-0 text-gray-400 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">CPU</div>
                  <div className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{size.cpu}</div>
                </div>
              </div>
            </div>
          </div>
        )})}
    </div>
  )
}