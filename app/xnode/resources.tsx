import React from 'react'
import { type Xnode } from '@/types/node'
import { HealthChartItem } from '../dashboard/health-data';

interface XNodeResourcesProps {
  xNode: Xnode;
  lastUpdated: string;
}

const Resources = ({ xNode, lastUpdated }: XNodeResourcesProps) => {
  return (
    <div className="mt-6  py-4">

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Resources</h2>
          <p className="text-xs text-[#8F8F8F]">
            Last updated {lastUpdated} ago
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-14">
        <div className="flex flex-col items-center gap-4 rounded-2xl border-[1.2px] border-[#E0E0E0]  px-4 py-1.5">
          <div className="text-center">
            <p className="font-bold">CPU</p>
            <p className="text-sm text-[#8F8F8F]">
              Current CPU utilization
            </p>
          </div>
          <HealthChartItem
            className="size-34"
            type="cpu"
            healthData={xNode.heartbeatData?.cpuPercent ?? 0}
          />
        </div>
        <div className="flex flex-col items-center gap-4 rounded-2xl border-[1.2px] border-[#E0E0E0]  px-4 py-1.5">
          <div className="text-center">
            <p className="font-bold">RAM</p>
            <p className="text-sm text-[#8F8F8F]">
              {Math.round(
                ((xNode.heartbeatData?.ramMbUsed ?? 0) / 1024) * 100
              ) / 100}
              GB/
              {Math.round(
                ((xNode.heartbeatData?.ramMbTotal ?? 0) / 1024) * 100
              ) / 100}
              GB
            </p>
          </div>
          <HealthChartItem
            className="size-34"
            type="ram"
            healthData={
              ((xNode.heartbeatData?.ramMbUsed ?? 0) /
                (xNode.heartbeatData?.ramMbTotal ?? 1)) *
              100
            }
          />
        </div>
        <div className="flex flex-col items-center gap-4 rounded-2xl border-[1.2px] border-[#E0E0E0]  px-4 py-1.5">
          <div className="text-center">
            <p className="font-bold">Storage</p>
            <p className="text-sm text-[#8F8F8F]">
              {Math.round(
                ((xNode.heartbeatData?.storageMbUsed ?? 0) / 1024) * 100
              ) / 100}
              GB/
              {Math.round(
                ((xNode.heartbeatData?.storageMbTotal ?? 1) / 1024) * 100
              ) / 100}
              GB
            </p>
          </div>
          <HealthChartItem
            className="size-34"
            type="storage"
            healthData={
              ((xNode.heartbeatData?.storageMbUsed ?? 0) /
                (xNode.heartbeatData?.storageMbTotal ?? 1)) *
              100
            }
          />
        </div>
      </div>
    </div>
  )
}

export default Resources