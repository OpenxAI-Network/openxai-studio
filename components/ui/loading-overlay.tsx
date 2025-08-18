'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  fadeOut?: boolean
}

export function LoadingOverlay({ isVisible, message = 'Reserving Xnode...', fadeOut = false }: LoadingOverlayProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isEntering, setIsEntering] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsEntering(true)
      setTimeout(() => setIsEntering(false), 50)
    }
  }, [isVisible])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isVisible || !isMounted) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 ease-in-out 
      ${fadeOut ? 'scale-95 opacity-0 backdrop-blur-none' : isEntering ? 'scale-105 opacity-0 backdrop-blur-none' : 'scale-100 opacity-100 backdrop-blur-sm'}`}
    >
      <div className={`flex flex-col items-center space-y-20 text-white transition-all delay-100 duration-500 
      ${fadeOut ? 'translate-y-2 opacity-0' : isEntering ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}>


        <div className="flex size-60 items-center justify-center">
          <Image
            src="/images/viewDeployment/layerAnim (1).gif"
            alt="Loading animation"
            width={350}
            height={350}
            unoptimized
          />
        </div>

        <div className="mt-20 text-center">
          <h3 className="mb-2 text-xl font-semibold">{message}</h3>
          <p className="text-sm text-gray-300">This can take up to 1 minute...</p>
        </div>
      </div>
    </div>
  )
}
