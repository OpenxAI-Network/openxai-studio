'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'

export type Signature = xnode.auth.login_input
type SignatureCacheContext = {
  getSignature: (xnode: string) => Signature | undefined
  setSignature: (xnode: string, signature: Signature) => void
}

const SignatureCacheContext = createContext<SignatureCacheContext | null>(null)

export function useSignatureCacheContext() {
  const context = useContext(SignatureCacheContext)
  if (!context) {
    throw new Error('Signature Cache Context must be used inside a provider.')
  }
  return context
}

type SignatureCacheContextProviderProps = PropsWithChildren<{}>
export default function SignatureCacheProvider({
  children,
}: SignatureCacheContextProviderProps) {
  const [cache, setCache] = useState<{
    [xnode: string]: Signature | undefined
  }>({})

  useEffect(() => {
    const stored = localStorage.getItem('signature-cache')
    if (stored) {
      // storedSettings could be missing certain settings only introduced later
      setCache(JSON.parse(stored))
    }
  }, [])

  const getSignature = (xnode: string) => {
    return cache[xnode] ?? undefined
  }

  const setSignature = (xnode: string, signature: Signature) => {
    setCache((cache) => {
      cache[xnode] = signature
      localStorage.setItem('signature-cache', JSON.stringify(cache))
      return cache
    })
  }

  return (
    <SignatureCacheContext.Provider value={{ getSignature, setSignature }}>
      {children}
    </SignatureCacheContext.Provider>
  )
}
