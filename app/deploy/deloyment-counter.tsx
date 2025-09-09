'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Rocket } from 'lucide-react'

export function DeploymentCounter({
  app,
  version,
}: {
  app?: string
  version?: string
}) {
  const { data: total } = useQuery({
    queryKey: ['app_deployments', app ?? '', version ?? ''],
    enabled: !!app,
    queryFn: async () => {
      return axios
        .get(
          `https://indexer.core.openxai.org/api/deployment_signature/total/xnode-ai-chat:${app}${version ? `/${version}` : ''}`
        )
        .then((res) => res.data as number)
    },
  })

  if (total === undefined) {
    return <></>
  }

  return (
    <div className="flex">
      <div className="flex place-items-center gap-1 rounded-lg bg-gray-200 h-6 xl:h-7 px-2 py-1">
        <Rocket className="size-3" />
        <span className="text-[10px] xl:text-[12px] 2xl:text-sm">{total?.toString()}</span>
      </div>
      <div className="grow" />
    </div>
  )
}
