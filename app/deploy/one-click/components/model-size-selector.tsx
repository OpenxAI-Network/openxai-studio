'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ModelSizeSelectorProps {
  selected?: ModelSize
  onSelect: (size: ModelSize) => void
}

export type ModelSize = {
  id: string
  name: string
  ramGB: number
  storageGB: number
  storageType: string
  cpuCores: number
  description?: string
}

export function ModelSizeSelector({ selected, onSelect }: ModelSizeSelectorProps) {
  const sizes: ModelSize[] = [
    {
      id: 'xs',
      name: '1.5b',
      ramGB: 8,
      storageGB: 10,
      storageType: 'SSD',
      cpuCores: 2,
      description: 'deepseek-r1'
    },
    // ... other sizes
  ]

  return (
    <div className="space-y-4 max-[1550px]:space-y-3.5 max-[1350px]:space-y-3 max-[1250px]:space-y-2.5 max-[992px]:space-y-2">
      {sizes.map((size) => (
        <div
          key={size.id}
          onClick={() => onSelect(size)}
          className={cn(
            "relative flex cursor-pointer items-center rounded-lg border p-6 max-[1550px]:p-5 max-[1350px]:p-4 max-[1250px]:p-3 max-[992px]:p-2",
            selected?.id === size.id && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-4 max-[1550px]:gap-3.5 max-[1350px]:gap-3 max-[1250px]:gap-2.5 max-[992px]:gap-2">
            <div className={cn(
              "max-[1550px]:size-2.75 size-3 rounded-full max-[1350px]:size-2.5 max-[1250px]:size-2 max-[992px]:size-1.5",
              selected?.id === size.id ? "bg-primary" : "border border-muted-foreground"
            )} />
            
            <div className="flex-1">
              <div className="flex items-center gap-6 max-[1550px]:gap-5 max-[1350px]:gap-4 max-[1250px]:gap-3 max-[992px]:gap-2">
                <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                  <div className="size-4 rounded-full bg-blue-500 max-[1550px]:size-3.5 max-[1350px]:size-3 max-[1250px]:size-2.5 max-[992px]:size-2" />
                  <span className="text-lg font-medium max-[1550px]:text-base max-[1350px]:text-sm max-[1250px]:text-xs max-[992px]:text-[10px]">{size.name}</span>
                </div>
                
                <div className="text-base text-gray-500 max-[1550px]:text-sm max-[1350px]:text-xs max-[1250px]:text-[11px] max-[992px]:text-[9px]">{size.description}</div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 max-[1550px]:mt-3.5 max-[1550px]:gap-3.5 max-[1350px]:mt-3 max-[1350px]:gap-3 max-[1250px]:mt-2.5 max-[1250px]:gap-2.5 max-[992px]:mt-2 max-[992px]:gap-2">
                <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                  <div className="max-[1550px]:size-5.5 max-[1250px]:size-4.5 flex size-6 items-center justify-center text-gray-400 max-[1350px]:size-5 max-[992px]:size-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <div className="text-[10px] text-gray-400 max-[1550px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">RAM</div>
                    <div className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{size.ramGB}GB</div>
                  </div>
                </div>
                
                <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                  <div className="max-[1550px]:size-5.5 max-[1250px]:size-4.5 flex size-6 items-center justify-center text-gray-400 max-[1350px]:size-5 max-[992px]:size-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5z"></path>
                      <path d="M8 10h8"></path>
                      <path d="M8 14h8"></path>
                      <path d="M8 18h8"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 max-[1550px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">Storage</div>
                    <div className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{size.storageGB}GB {size.storageType}</div>
                  </div>
                </div>
                
                <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-2 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                  <div className="max-[1550px]:size-5.5 max-[1250px]:size-4.5 flex size-6 items-center justify-center text-gray-400 max-[1350px]:size-5 max-[992px]:size-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <div className="text-[10px] text-gray-400 max-[1550px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">CPU</div>
                    <div className="text-sm max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{size.cpuCores} cores</div>
                  </div>
                </div>
              </div>
            </div>
            
            {selected?.id === size.id && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 max-[1550px]:right-3.5 max-[1350px]:right-3 max-[1250px]:right-2.5 max-[992px]:right-2">
                <Check className="max-[1550px]:size-5.5 max-[1250px]:size-4.5 size-6 text-green-500 max-[1350px]:size-5 max-[992px]:size-4" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}