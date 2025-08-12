import React from 'react'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import {
  useUsageCpu,
  useUsageDisk,
  useUsageMemory,
} from '@openmesh-network/xnode-manager-sdk-react'

import { HealthChartItem } from '../dashboard/health-data'

interface XNodeResourcesProps {
  session: xnode.utils.Session
}

const formatGB = (bytes: number | undefined): string => {
  if (!bytes || bytes <= 0) return '0'
  return (bytes / 1_000_000_000).toFixed(2)
}
type HealthType = 'cpu' | 'ram' | 'storage'

const ResourceCard = ({
  title,
  subtitle,
  type,
  value,
}: {
  title: string
  subtitle: React.ReactNode
  type: HealthType
  value: number
}) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border-[1.2px] border-[#E0E0E0] px-4 pb-0 pt-4">
    <div className="text-center">
      <p className="font-bold">{title}</p>
      <p className="text-sm text-[#8F8F8F]">{subtitle}</p>
    </div>
    <HealthChartItem className="size-34" type={type} healthData={value} />
  </div>
)

const Resources = ({ session }: XNodeResourcesProps) => {
  const { data: cpu } = useUsageCpu({
    session,
    scope: 'host',
  })
  const { data: memory } = useUsageMemory({
    session,
    scope: 'host',
  })
  const { data: disk } = useUsageDisk({ session, scope: 'host' })

  return (
    <div className="mt-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Resources</h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-14 lg:grid-cols-3">
        {cpu && (
          <ResourceCard
            title="CPU"
            subtitle="Current CPU utilization"
            type="cpu"
            value={cpu.reduce((prev, cur) => prev + cur.used, 0) / cpu.length}
          />
        )}

        {memory && (
          <ResourceCard
            title="RAM"
            subtitle={`${formatGB(memory.used)} GB / ${formatGB(memory.total)} GB`}
            type="ram"
            value={(memory.used / memory.total) * 100}
          />
        )}

        {disk && (
          <ResourceCard
            title="Storage"
            subtitle={`${formatGB(disk.reduce((prev, cur) => prev + cur.used, 0))} GB / ${formatGB(disk.reduce((prev, cur) => prev + cur.total, 0))} GB`}
            type="storage"
            value={
              disk.reduce(
                (prev, cur) => prev + (cur.used / cur.total) * 100,
                0
              ) / disk.length
            }
          />
        )}
      </div>
    </div>
  )
}

export default Resources
