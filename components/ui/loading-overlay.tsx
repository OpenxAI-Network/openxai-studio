
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLoading } from '@/contexts/LoadingContext'
import { usePathname } from 'next/navigation'
import { useDeploymentQueueContext } from '../deployment-queue'

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useLoading()
  const { isDeploymentComplete,setDeploymentComplete} = useDeploymentQueueContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldRender, setShouldRender] = useState(isLoading)
  const [loop, setLoop] = useState(true)
  const [fastForward, setFastForward] = useState(false)
  const pathname = usePathname()

  const FAST_FORWARD_START = 300 

  const applySpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const forceSpeedApplication = useCallback((speed: number) => {
    setTimeout(() => {
      applySpeed(speed)
      setTimeout(() => applySpeed(speed), 100)
    }, 50)
  }, [])

  const jumpToTimeAndSpeed = useCallback((time: number, speed: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setTimeout(() => {
        forceSpeedApplication(speed)
      }, 100)
    }
  }, [forceSpeedApplication])

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
      setLoop(true)
      setDeploymentComplete(false)
      setFastForward(false)
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
        forceSpeedApplication(3)
      }
    } else if (videoRef.current) {
      setLoop(false)
      setFastForward(true)
      
     
      if (fastForward && pathname === '/deployments' && isDeploymentComplete ) {
        console.log("Now speeded ==>",isDeploymentComplete)
        jumpToTimeAndSpeed(FAST_FORWARD_START, 16)
        // setTimeout(()=>{
        //   jumpToTimeAndSpeed(FAST_FORWARD_START, 8)
        // },11000)
       
        // forceSpeedApplication(16)
      } else if (pathname !== '/deployments') {
        
        // jumpToTimeAndSpeed(FAST_FORWARD_START, 16)
      } else {
        
        forceSpeedApplication(3)
      }
    }
  }, [isLoading, forceSpeedApplication, jumpToTimeAndSpeed, FAST_FORWARD_START, pathname, isDeploymentComplete])

  useEffect(() => {
    if (shouldRender && videoRef.current) {
      const intervalId = setInterval(() => {
        if (isLoading) {
          applySpeed(3)
        } else if (fastForward && pathname === '/deployments' && isDeploymentComplete) {
          applySpeed(16)
        }
      }, 100)

      return () => clearInterval(intervalId)
    }
  }, [shouldRender, isLoading, fastForward, pathname, isDeploymentComplete])

  const handleVideoEnd = () => {
    if (!loop) {
      setShouldRender(false)
    }
  }

  const handleVideoLoaded = () => {
    if (isLoading) {
      forceSpeedApplication(3)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    } else if (fastForward) {
      forceSpeedApplication(3)
    }
  }

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-10">
        <div className="flex size-1/3  2xl:size-1/2 items-center justify-center">
          <video
            ref={videoRef}
            className="size-full object-contain"
            loop={loop} 
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            onLoadedMetadata={handleVideoLoaded}
          >
            <source src="/video/layers-animation.webm" type="video/webm"/>
          </video>
        </div>
        
      </div>
    </div>
  )
}