'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import flowAnimation from '@/utils/Flow 1.json'

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 ease-in-out ${fadeOut ? 'opacity-0 scale-95 backdrop-blur-none' : isEntering ? 'opacity-0 scale-105 backdrop-blur-none' : 'opacity-100 scale-100 backdrop-blur-sm'
        }`}
    >
      <div className={`flex flex-col items-center space-y-20 text-white transition-all duration-500 delay-100 ${fadeOut ? 'opacity-0 translate-y-2' : isEntering ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}>
        <div className="w-60 h-60 flex items-center justify-center">
          <Lottie
            animationData={flowAnimation}
            loop={true}
            autoplay={true}
          />
        </div>
        <div className="text-center mt-20">
          <h3 className="text-xl font-semibold mb-2">
            {message}
          </h3>
          <p className="text-gray-300 text-sm">
            This can take up to 1 minute...
          </p>
        </div>
      </div>
    </div>
  )
}
