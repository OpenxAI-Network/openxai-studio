'use client'

import { createContext, useContext, useState } from 'react'

export interface DemoDeploymentContext {
  deployed: boolean
}
const defaultContext: DemoDeploymentContext = { deployed: true }
const DemoDeploymentContext =
  createContext<DemoDeploymentContext>(defaultContext)
const SetDemoDeploymentContext = createContext<
  (demoDeploymentContext: DemoDeploymentContext) => void
>(() => {})

export function DemoDeploymentContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [demoDeploymentContext, setDemoDeploymentContext] =
    useState<DemoDeploymentContext>(defaultContext)

  return (
    <DemoDeploymentContext.Provider value={demoDeploymentContext}>
      <SetDemoDeploymentContext.Provider value={setDemoDeploymentContext}>
        {children}
      </SetDemoDeploymentContext.Provider>
    </DemoDeploymentContext.Provider>
  )
}

export function useDemoDeploymentContext() {
  return useContext(DemoDeploymentContext)
}

export function useSetDemoDeploymentContext() {
  return useContext(SetDemoDeploymentContext)
}
