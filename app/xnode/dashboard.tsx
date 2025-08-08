'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { servicesCompressedForAdmin } from '@/utils/xnode'
import { useQuery } from '@tanstack/react-query'
import { addYears, formatDistanceToNowStrict } from 'date-fns'
import { useUser } from 'hooks/useUser'
import { ChevronRight } from 'lucide-react'
import { useAccount } from 'wagmi'

import {
  serviceByName,
  type ServiceData,
  type ServiceOption,
  type XnodeConfig,
} from '@/types/dataProvider'
import { type Xnode } from '@/types/node'
import { mockXNodes } from '@/config/demo-mode'
import { cn, formatXNodeName } from '@/lib/utils'
import { useDemoModeContext } from '@/components/demo-mode'
import Signup from '@/components/Signup'

import Delete from './delete'
import Deployed_Apps from './deployed-apps'
import PlanManagement from './planManagement'
import Resources from './resources'
import Skeleton_deployment from './skeleton'

type XnodePageProps = {
  xNodeId: string
}

export default function XNodeDashboard({ xNodeId }: XnodePageProps) {
  const { address } = useAccount()
  const { demoMode } = useDemoModeContext()
  const testXNode = useMemo<Xnode | null>(() => {
    if (!demoMode) return null
    return mockXNodes.find((node) => node.id === xNodeId) ?? null
  }, [demoMode, xNodeId])

  const [user] = useUser()

  {
    /* --------------just for testing purposes, remove later ---------------*/
  }

  // const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true);
  // useEffect(() => {

  //     const timer = setTimeout(() => {
  //       setIsLoadingSkeleton(false);
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }, []);

  const {
    data: xNodeData,
    isSuccess,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useQuery<Xnode>({
    queryKey: ['xnodes', xNodeId],
    queryFn: async () => {
      if (resetting) return xNodeData

      if (!user?.sessionToken) return null
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/getXnode`,
        {
          method: 'POST',
          headers: {
            'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
            'X-Parse-Session-Token': user.sessionToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: xNodeId,
          }),
        }
      ).then((res) => res.json())
      return {
        ...data,
        heartbeatData:
          data.heartbeatData !== null
            ? JSON.parse(data.heartbeatData as any as string)
            : null,
      }
    },
    refetchInterval: 10 * 1000,
    enabled: !!user?.sessionToken && !demoMode,
  })
  const xNode = testXNode ?? xNodeData

  const [lastUpdated, setLastUpdated] = useState<string>('0 seconds')

  function reloadLastUpdated(updatedAt: number) {
    if (updatedAt === 0) return
    setLastUpdated(formatDistanceToNowStrict(updatedAt))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      reloadLastUpdated(dataUpdatedAt)
    }, 1000)
    return () => clearInterval(interval)
  }, [dataUpdatedAt])

  const services = useMemo<XnodeConfig | null>(() => {
    if (!xNode?.services) return null
    return JSON.parse(
      Buffer.from(xNode?.services, 'base64').toString('utf-8')
    ) as XnodeConfig
  }, [xNode?.services])

  const [deleteServiceOpen, setDeleteServiceOpen] = useState<
    ServiceData['nixName'] | null
  >(null)

  const [resetting, setResetting] = useState<boolean>(false)

  const deleteService = useCallback(async () => {
    if (demoMode) return
    if (!services?.services || !user?.sessionToken) return
    const servicesWithChanges = services.services.filter(
      (service) => service.nixName !== deleteServiceOpen
    )
    const formattedServices = servicesCompressedForAdmin(servicesWithChanges)

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/pushXnodeServices`,
      {
        method: 'POST',
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': user.sessionToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: xNodeId,
          services: Buffer.from(
            JSON.stringify({
              services: formattedServices,
            })
          ).toString('base64'),
        }),
      }
    )
    setDeleteServiceOpen(null)
    await new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
      refetch()
    )
  }, [
    demoMode,
    deleteServiceOpen,
    refetch,
    services?.services,
    user?.sessionToken,
    xNodeId,
  ])

  return (
    <div className="container mx-auto mb-12 mt-0 max-w-screen-3xl">
      {isLoading && !demoMode ? <Skeleton_deployment /> : null}
      {(isSuccess || demoMode) && user?.sessionToken ? (
        <>
          {/* ---------------------------- New code based on new UI ----------------------------------------------- */}

          <Delete
            deleteServiceOpen={deleteServiceOpen}
            setDeleteServiceOpen={setDeleteServiceOpen}
            deleteService={deleteService}
          />

          <div className="flex w-full flex-col gap-6 bg-white py-6">
            <div className="mb-4 flex items-center space-x-2">
              <span className="text-lg text-[#8F8F8F]">Deployment</span>
              <ChevronRight size={20} className="text-[#9B9B9B]" />
              <span className="text-lg font-medium text-[#525252]">
                {xNode.name}
              </span>
            </div>
            <PlanManagement xnode={xNode} />
          </div>
          <Resources xNode={xNode} lastUpdated={lastUpdated} />

          <Deployed_Apps
            services={services?.services}
            xNode={xNode}
            setDeleteServiceOpen={setDeleteServiceOpen}
          />
        </>
      ) : null}
      {!isFetching && !isSuccess && !demoMode ? <Signup /> : null}
    </div>
  )
}
