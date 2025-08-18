'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import {
  useUsageCpu,
  useUsageDisk,
  useUsageMemory,
} from '@openmesh-network/xnode-manager-sdk-react'
import { ArrowUpRight } from 'lucide-react'

import PlanDetails from './planDetails'
import TransferNFT from './transferNft'

interface PlanManagementProps {
  session?: xnode.utils.Session
  tokenId?: bigint
}

const formatGb = (bytes: number): string => {
  if (bytes >= 1024 ** 5) return `${(bytes / 1024 ** 5).toFixed(1)}PB`
  if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(0)}TB`
  return `${(bytes / 1024 ** 3).toFixed(0)}GB`
}

export default function PlanManagement({
  session,
  tokenId,
}: PlanManagementProps) {
  const { data: cpu } = useUsageCpu({
    session,
    scope: 'host',
  })
  const { data: memory } = useUsageMemory({
    session,
    scope: 'host',
  })
  const { data: disk } = useUsageDisk({ session, scope: 'host' })
  const gpu = 'Nvidia RTX A4000'

  const formattedSpecs = useMemo(() => {
    return `${cpu?.length ?? 0} cores, ${formatGb(memory?.total ?? 0)} RAM, ${formatGb(disk?.reduce((prev, cur) => prev + cur.total, 0) ?? 0)} Storage, ${gpu} GPU`
  }, [cpu, memory, disk, gpu])

  return (
    <div className="">
      <div className="mb-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/viewDeployment/xnode.svg"
            alt="XNode"
            width={56}
            height={56}
          />

          <div>
            <div className="flex items-center gap-1">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-[#000000]">
                {session?.baseUrl.replace('https://manager.', '')}
                <Image
                  src="/images/viewDeployment/ollama.svg"
                  alt="Ollama"
                  width={24}
                  height={24}
                />
              </h2>
            </div>
            <p className="text-sm text-[#8F8F8F]">{formattedSpecs}</p>
          </div>
        </div>

        <button
          className="flex cursor-not-allowed items-center rounded-md bg-blue500 px-4 py-2 text-sm font-[500] text-white opacity-50"
          disabled
        >
          Push to Marketplace
          <ArrowUpRight className="ml-2" />
        </button>
      </div>

      <div className="space-y-6">
        <PlanDetails tokenId={tokenId} />
        <TransferNFT tokenId={tokenId} />
      </div>
    </div>
  )
}
