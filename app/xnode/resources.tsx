import React from 'react';
import { type Xnode } from '@/types/node';
import { HealthChartItem } from '../dashboard/health-data';

interface XNodeResourcesProps {
  xNode: Xnode;
  lastUpdated: string;
}


const formatGB = (mb: number | undefined): string => {
  if (!mb || mb <= 0) return '0';
  return (mb / 1024).toFixed(2);
};
type HealthType = 'cpu' | 'ram' | 'storage';

const ResourceCard = ({
  title,
  subtitle,
  type,
  value,
}: {
  title: string;
  subtitle: React.ReactNode;
  type: HealthType;
  value: number;
}) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border-[1.2px] border-[#E0E0E0] px-4 pb-0 pt-4">
    <div className="text-center">
      <p className="font-bold">{title}</p>
      <p className="text-sm text-[#8F8F8F]">{subtitle}</p>
    </div>
    <HealthChartItem className="size-34" type={type} healthData={value} />
  </div>
);

const Resources = ({ xNode, lastUpdated }: XNodeResourcesProps) => {
  const {
    cpuPercent = 0,
    ramMbUsed = 0,
    ramMbTotal = 1,
    storageMbUsed = 0,
    storageMbTotal = 1,
  } = xNode.heartbeatData ?? {};

  const ramUsedGB = formatGB(ramMbUsed);
  const ramTotalGB = formatGB(ramMbTotal);
  const ramUsagePercent = (ramMbUsed / ramMbTotal) * 100;

  const storageUsedGB = formatGB(storageMbUsed);
  const storageTotalGB = formatGB(storageMbTotal);
  const storageUsagePercent = (storageMbUsed / storageMbTotal) * 100;

  return (
    <div className="mt-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Resources</h2>
          <p className="text-xs text-[#8F8F8F]">
            Last updated {lastUpdated} ago
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-14">
        <ResourceCard
          title="CPU"
          subtitle="Current CPU utilization"
          type="cpu"
          value={cpuPercent}
        />

        <ResourceCard
          title="RAM"
          subtitle={`${ramUsedGB} GB / ${ramTotalGB} GB`}
          type="ram"
          value={ramUsagePercent}
        />

        <ResourceCard
          title="Storage"
          subtitle={`${storageUsedGB} GB / ${storageTotalGB} GB`}
          type="storage"
          value={storageUsagePercent}
        />
      </div>
    </div>
  );
};

export default Resources;
