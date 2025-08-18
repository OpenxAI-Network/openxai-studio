import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import {
  useConfigContainerGet,
  useConfigContainers,
  useConfigContainerSet,
} from '@openmesh-network/xnode-manager-sdk-react'

import { useDeploymentQueueContext } from '@/components/deployment-queue'
import { AppDelete } from '@/components/xnode/app/delete'
import { AppEdit } from '@/components/xnode/app/edit'
import { AppUpdate } from '@/components/xnode/app/update'
import { FileExplorer } from '@/components/xnode/common/file-explorer'
import { Processes } from '@/components/xnode/common/processes'
import { useRequestPopup } from '@/components/xnode/request-popup'

interface DeployedAppsProps {
  session: xnode.utils.Session
}

const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) => (
  <div className="flex items-center gap-1">
    <div className="size-5 shrink-0 text-gray-400">{icon}</div>
    <div>
      <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">
        {label}
      </div>
      <div className="text-sm font-[500] max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">
        {value}
      </div>
    </div>
  </div>
)

const DeployedApps = ({ session }: DeployedAppsProps) => {
  const { push } = useRouter()

  const { data: containers } = useConfigContainers({
    session,
  })

  // const { data: cpu } = useUsageCpu({
  //   session,
  //   scope: 'host',
  // })
  // const { data: memory } = useUsageMemory({
  //   session,
  //   scope: 'host',
  // })
  // const { data: disk } = useUsageDisk({ session, scope: 'host' })

  const { getQueue, removeFromQueue } = useDeploymentQueueContext()

  const setRequestPopup = useRequestPopup()
  const { mutate: set } = useConfigContainerSet()
  useEffect(() => {
    if (!session) {
      return
    }

    const queue = getQueue(session.baseUrl)
    if (queue.length > 0) {
      let deployment = queue[0]
      set(
        {
          session,
          ...deployment,
        },
        {
          onSuccess({ request_id }) {
            setRequestPopup({
              request_id,
              onFinish: () => {
                removeFromQueue(session.baseUrl, deployment.path.container)
              },
            })
          },
        }
      )
    }
  }, [session, getQueue])

  if (!containers) {
    return <></>
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-2 pt-8">
        <div className="text-sm font-bold text-[#141414] xl:text-base 2xl:text-xl 3xl:text-2xl">
          Apps ({containers.length})
        </div>
        <button
          onClick={() => push('/app-store')}
          className="rounded-lg border-2 border-[#525252] px-8 py-2 font-medium text-[#525252]"
        >
          + Add App
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 py-4 lg:grid-cols-3">
        {containers.map((container) => (
          <Container key={container} container={container} session={session} />
        ))}
      </div>
    </div>
  )
}

function Container({
  container,
  session,
}: {
  container: string
  session: xnode.utils.Session
}) {
  const { data: config } = useConfigContainerGet({ session, container })

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border p-6">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <Image
            src={`/images/apps/${container}.png`}
            alt="logo"
            width={50}
            height={50}
          />
          <div className="flex flex-col gap-1">
            <div className="text-[12px] font-[600] text-[#141414] xl:text-[16px] 2xl:text-[16px] 3xl:text-[24px]">
              {container}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#525252]">
              <span className="text-[12px] font-[500] text-[#525252] xl:text-[14px] 2xl:text-[14px] 3xl:text-[20px]">
                {config?.flake
                  .split('services.xnode-ai-chat.defaultModel = "')
                  .at(1)
                  ?.split('"')
                  .at(0)}
              </span>
            </div>
          </div>
        </div>
        <AppDelete session={session} container={container} />
      </div>

      {/* <div className="flex justify-between gap-4 py-2">
                <InfoItem
                  label="RAM"
                  value={`${(memory?.total ?? 0) / 1_000_000} GB`}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="2.18"
                        ry="2.18"
                      ></rect>
                      <line x1="7" y1="2" x2="7" y2="22"></line>
                      <line x1="17" y1="2" x2="17" y2="22"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <line x1="2" y1="7" x2="7" y2="7"></line>
                      <line x1="2" y1="17" x2="7" y2="17"></line>
                      <line x1="17" y1="17" x2="22" y2="17"></line>
                      <line x1="17" y1="7" x2="22" y2="7"></line>
                    </svg>
                  }
                />
                <InfoItem
                  label="Storage"
                  value={`${(disk?.reduce((prev, cur) => prev + cur.total, 0) ?? 0) / 1_000_000} GB`}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5z"></path>
                      <path d="M8 10h8"></path>
                      <path d="M8 14h8"></path>
                      <path d="M8 18h8"></path>
                    </svg>
                  }
                />
                <InfoItem
                  label="CPU"
                  value={`${cpu?.length ?? 0} cores`}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="2"
                        ry="2"
                      ></rect>
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
                  }
                />
              </div> */}

      <div className="grid grid-cols-2 gap-4">
        <Processes session={session} scope={`container:${container}`} />
        <FileExplorer session={session} scope={`container:${container}`} />
        <AppEdit session={session} container={container} />
        <AppUpdate session={session} container={container} />
      </div>

      <Link
        href={session.baseUrl.replace('manager.', '')}
        aria-disabled={container !== 'xnode-ai-chat'}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center justify-center gap-3 rounded-md bg-primary py-2 text-sm font-medium text-white aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        Open {container}
        <Image src="/images/arrow-up-right.svg" alt="" width={20} height={20} />
      </Link>
    </div>
  )
}

export default DeployedApps
