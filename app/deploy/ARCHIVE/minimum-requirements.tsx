'use client'

import { Cpu, HardDrive, MemoryStick } from 'lucide-react'
import { type Specs } from '@/types/dataProvider'

type MinimumRequirementsProps = {
  specs?: Specs
}

export function MinimumRequirements({ specs }: MinimumRequirementsProps) {
  if (!specs) return null

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Minimum Requirements</h3>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <Cpu className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">CPU</p>
            <p className="text-sm text-muted-foreground">
              {specs.cpuCores} Cores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MemoryStick className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">RAM</p>
            <p className="text-sm text-muted-foreground">
              ~{specs.ramMin}GB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <HardDrive className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Storage</p>
            <p className="text-sm text-muted-foreground">
              ~{specs.storageMin}GB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 