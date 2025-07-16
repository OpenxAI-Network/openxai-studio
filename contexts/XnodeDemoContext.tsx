'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'

import type { DemoXnode } from '@/lib/xnode-demo'

export interface DemoContext {
  xnode?: DemoXnode
  deploymentId?: xnode.request.RequestId
  processes?: string[]
}
const defaultContext: DemoContext = {}
const DemoContext = createContext<DemoContext>(defaultContext)
const SetDemoContext = createContext<(demoContext: DemoContext) => void>(
  () => {}
)

export function DemoContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [demoContext, setDemoContext] = useState<DemoContext>(defaultContext)

  const updateContext = (context: DemoContext) => {
    setDemoContext(context)
    localStorage.setItem('demoContext', JSON.stringify(context))
  }

  useEffect(() => {
    const storedContext = localStorage.getItem('demoContext')
    if (storedContext) {
      // storedContext could be missing certain settings only introduced later
      setDemoContext({
        ...defaultContext,
        ...JSON.parse(storedContext),
      })
    }
  }, [])

  return (
    <DemoContext.Provider value={demoContext}>
      <SetDemoContext.Provider value={updateContext}>
        {children}
      </SetDemoContext.Provider>
    </DemoContext.Provider>
  )
}

export function useDemoContext() {
  return useContext(DemoContext)
}

export function useSetDemoContext() {
  return useContext(SetDemoContext)
}
