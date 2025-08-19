'use client'

import { useEffect, useMemo, useState } from 'react'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import { useAuthLogin } from '@openmesh-network/xnode-manager-sdk-react'
import { ChevronRight } from 'lucide-react'

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
      <div className="container mx-auto mb-12 mt-0 max-w-screen-3xl">
        {signature &&
          !session &&
          (status !== 'success' ? (
            <div className="mt-40 flex place-items-center justify-center gap-5">
              <div className="size-16 animate-spin rounded-full border-b-2 border-[#0354EC]" />
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-semibold">
                  XnodeOS is installing...
                </span>
                <span className="text-sm text-black/60">
                  This can take up to 10 minutes. The page will reload
                  automatically.
                </span>
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
