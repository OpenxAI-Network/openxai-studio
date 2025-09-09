'use client'

import { useEffect, useMemo, useState } from 'react'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import { useAuthLogin } from '@openmesh-network/xnode-manager-sdk-react'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSignatureCacheContext } from '@/components/signature-cache'
import { Signup } from '@/components/Signup'
import { RequestPopupProvider } from '@/components/xnode/request-popup'

import PlanManagement from './planManagement'
import Resources from './resources'
import Rewards from './rewards'
import Skeleton_deployment from './skeleton'

type XnodePageProps = {
  baseUrl: string
}

export default function XNodeDashboard({ baseUrl }: XnodePageProps) {
  const { getSignature, setSignature: setSignatureCache } =
    useSignatureCacheContext()

  const [signature, setSignature] = useState<
    xnode.auth.login_input | undefined
  >(undefined)
  useEffect(() => {
    setSignature(getSignature(baseUrl))
  }, [getSignature])

  const { data: session, status } = useAuthLogin({
    baseUrl,
    ...signature,
    overrides: {
      retry: true,
      retryDelay: 10_000,
    },
  })

  const tokenId = useMemo(() => {
    try {
      return BigInt(
        session.baseUrl
          .replace('https://manager.', '')
          .replace('.base.ownaiv1.openxai.network', '')
      )
    } catch {
      return undefined
    }
  }, [session])

  return (
    <RequestPopupProvider session={session}>
      <div
        className={cn(
          'container mx-auto mb-12 mt-0 max-w-screen-3xl',
          signature && !session && status !== 'success' && 'bg-black'
        )}
      >
        {signature &&
          !session &&
          (status !== 'success' ? (
            <div className="flex flex-col place-items-center">
              <div className="max-w-[700px]">
                <video
                  className="size-full object-contain"
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                >
                  <source
                    src="/video/layers-animation.webm"
                    type="video/webm"
                  />
                </video>
              </div>
            </div>
          ) : (
            <Skeleton_deployment />
          ))}
        {session && (
          <>
            <div className="flex w-full flex-col gap-6 bg-white py-6">
              <div className="mb-4 flex items-center space-x-2">
                <span className="text-lg text-[#8F8F8F]">Deployment</span>
                <ChevronRight size={20} className="text-[#9B9B9B]" />
                <span className="text-lg font-medium text-[#525252]">
                  {baseUrl.replace('https://manager.', '')}
                </span>
              </div>
              <PlanManagement session={session} tokenId={tokenId} />
            </div>
            <Resources session={session} />

            <Rewards tokenId={tokenId} />
          </>
        )}
        {!signature && (
          <Signup
            xnode={baseUrl}
            onSigned={(signature) => {
              setSignature(signature)
              setSignatureCache(baseUrl, signature)
            }}
          />
        )}
      </div>
    </RequestPopupProvider>
  )
}
