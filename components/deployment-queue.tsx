'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'

export type Deployment = Omit<xnode.config.set_input, 'session'>
type DeploymentQueueContext = {
  getQueue: (xnode: string) => Deployment[]
  addToQueue: (xnode: string, deployment: Deployment) => void
  removeFromQueue: (xnode: string, container: string) => void
  isDeploymentComplete: boolean 
  setDeploymentComplete: (complete: boolean) => void
 
}

const DeploymentQueueContext = createContext<DeploymentQueueContext | null>(
  null
)

export function useDeploymentQueueContext() {
  const context = useContext(DeploymentQueueContext)
  if (!context) {
    throw new Error('Deployment Queue Context must be used inside a provider.')
  }
  return context
}

type DeploymentQueueContextProviderProps = PropsWithChildren<{}>
export default function DeploymentQueueProvider({
  children,
}: DeploymentQueueContextProviderProps) {
  const [queue, setQueue] = useState<{
    [xnode: string]: Deployment[] | undefined
  }>({})
  const [isDeploymentComplete, setDeploymentComplete] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('deployment-queue')
    if (stored) {
      // storedSettings could be missing certain settings only introduced later
      setQueue(JSON.parse(stored))
    }
  }, [])

  

  const getQueue = (xnode: string) => {
    return queue[xnode] ?? []
  }

  const addToQueue = (xnode: string, deployment: Deployment) => {
    setQueue((queue) => {
      if (!queue[xnode]) {
        queue[xnode] = []
      }

      queue[xnode].push(deployment)
      localStorage.setItem('deployment-queue', JSON.stringify(queue))
      return queue
    })
  }

  const removeFromQueue = (xnode: string, container: string) => {
    setQueue((queue) => {
      queue[xnode] = queue[xnode]?.filter(
        (deployment) => deployment.path.container !== container
      )
      localStorage.setItem('deployment-queue', JSON.stringify(queue))
      return queue
    })
  }

  return (
    <DeploymentQueueContext.Provider
      value={{ getQueue, addToQueue, removeFromQueue,isDeploymentComplete, setDeploymentComplete}}
    >
      {children}
    </DeploymentQueueContext.Provider>
  )
}
