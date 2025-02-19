'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDemoContext, useSetDemoContext } from '@/contexts/XnodeDemoContext'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { Check, Clock, RefreshCcw, RotateCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { deployModel, reserveDemo, useDemosAvailable } from '@/lib/xnode-demo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'

import { ERCOptions } from './erc-options'
import { ModelSizeSelector } from './model-size-selector'
import { ProviderSelector } from './provider-selector'

type DeploymentStep = {
  modelSize?: any
  provider?: any
  ercOption?: any
}

export function DeploymentPanel() {
  const router = useRouter()
  const [step, setStep] = useState<DeploymentStep>({})
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [redirectCounter, setRedirectCounter] = useState(30)
  const [deploymentProgress, setDeploymentProgress] = useState<{
    step: number
    status: string[]
  }>({ step: 0, status: [] })

  const deploymentSteps = [
    'Model is selected',
    'Infrastructure activated',
    'Deploying your service',
  ]

  const handleModelClick = () => {
    if (currentStep > 0) {
      setCurrentStep(0)
      // Only reset subsequent steps, keep current model selection
      setStep((prev) => ({
        modelSize: prev.modelSize,
        provider: undefined,
        ercOption: undefined,
      }))
    }
  }

  const handleProviderClick = () => {
    if (currentStep > 1) {
      setCurrentStep(1)
      // Only reset ERC option, keep model and provider selections
      setStep((prev) => ({
        ...prev,
        ercOption: undefined,
      }))
    }
  }

  const handleERCClick = () => {
    if (currentStep > 2) {
      setCurrentStep(2)
    }
  }

  const handleModelSelect = (model: any) => {
    setStep((prev) => ({
      modelSize: model,
      provider: undefined,
      ercOption: undefined,
    }))
    setCurrentStep(1)
  }

  const handleProviderSelect = (provider: any) => {
    setStep((prev) => ({ ...prev, provider }))
    setCurrentStep(2)
  }

  const handleERCSelect = (ercOption: any) => {
    setStep((prev) => ({ ...prev, ercOption }))
    setCurrentStep(3)
  }

  const handleDeploy = async () => {
    setDeploymentModalOpen(true)
    setDeploymentProgress({
      step: 0,
      status: [
        'Preparing to deploy on XnodeG 001',
        'Installing Ollama 3.1',
        'Installing WebUI...',
      ],
    })

    // Simulate deployment progress
    setTimeout(() => {
      setDeploymentProgress((prev) => ({ ...prev, step: 1 }))
      setTimeout(() => {
        setDeploymentProgress((prev) => ({ ...prev, step: 2 }))
        // Show success after deployment completes
        setTimeout(() => {
          setDeploymentModalOpen(false)
          setSuccessModalOpen(true)
          startRedirectCountdown()
        }, 2000)
      }, 2000)
    }, 2000)
  }

  const startRedirectCountdown = () => {
    const interval = setInterval(() => {
      setRedirectCounter((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const { toast } = useToast()

  const demos = useDemosAvailable()
  const demoXnode = demos.data?.find((x) => !x.reservation)
  const reservedXnode = useDemoContext()
  const setReservedXnode = useSetDemoContext()

  const deployOnDemo = async () => {
    const activeReservation =
      reservedXnode.xnode?.reservation &&
      reservedXnode.xnode.reservation.reserved_until > Date.now() / 1000
    const xnode = activeReservation ? reservedXnode.xnode : demoXnode

    if (!activeReservation && !demoXnode) {
      const nextFreeXnode = demos.data
        ?.map((x) => x.reservation?.reserved_until)
        .sort()
        .at(0)
      toast({
        title: 'Deployment failed',
        description: `No demo xnodes available. ${nextFreeXnode ? `Next xnode will be free in ${Math.round((nextFreeXnode - Date.now() / 1000) / 60)} minutes.` : ''}`,
        variant: 'destructive',
      })
      return
    }

    let { dismiss } = toast({
      title: 'Deploying...',
    })
    try {
      if (!activeReservation) {
        await reserveDemo({ xnode_id: demoXnode.id }).then((xnode) =>
          setReservedXnode({ xnode })
        )
      }

      let retry = 1
      while (true) {
        try {
          await deployModel({
            xnode_id: xnode.id,
            model: 'deepseek-r1:1.5b',
            email: 'samuel.mens@openmesh.network',
            password: 'password',
          })
          break
        } catch (e) {
          console.warn(e)
          retry--
          if (retry < 0) {
            throw e
          }
        }
      }
    } catch (e) {
      console.error(e)
      dismiss()
      toast({
        title: 'Deployment failed',
        description: e.message ?? 'An unknown error occurred.',
        variant: 'destructive',
      })
      return
    }

    dismiss()
    toast({
      title: 'Deployed!',
      description: 'Deployment on demo xnode has finished.',
    })
    setTimeout(
      () => window.open(xnode.id.replace(':34392', ''), '_blank'),
      45_000 // takes some time for open-webui to be ready
    )
  }

  return (
    <>
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">One Click Deployment</h2>

        <div
          className={cn(
            'relative cursor-pointer rounded-lg border',
            currentStep > 0 && 'border-primary bg-primary/5'
          )}
          onClick={handleModelClick}
        >
          <ModelSizeSelector
            selected={step.modelSize}
            showAll={currentStep === 0}
            onSelect={handleModelSelect}
          />
          {currentStep > 0 && step.modelSize && (
            <div className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
              <Check className="size-4 stroke-[3] text-white" />
            </div>
          )}
        </div>

        {currentStep >= 1 && (
          <div
            className={cn(
              'relative cursor-pointer rounded-lg border',
              currentStep > 1 && 'border-primary bg-primary/5'
            )}
            onClick={handleProviderClick}
          >
            <ProviderSelector
              selected={step.provider}
              showAll={currentStep === 1}
              onSelect={handleProviderSelect}
            />
            {currentStep > 1 && step.provider && (
              <div className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
                <Check className="size-4 stroke-[3] text-white" />
              </div>
            )}
          </div>
        )}

        {currentStep >= 2 && (
          <div
            className={cn(
              'relative cursor-pointer rounded-lg border',
              currentStep > 2 && 'border-primary bg-primary/5'
            )}
            onClick={handleERCClick}
          >
            <ERCOptions
              selected={step.ercOption}
              showAll={currentStep === 2}
              onSelect={handleERCSelect}
            />
            {currentStep > 2 && step.ercOption && (
              <div className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
                <Check className="size-4 stroke-[3] text-white" />
              </div>
            )}
          </div>
        )}

        {currentStep >= 2 && (
          <Button
            className="w-full"
            size="lg"
            onClick={() => deployOnDemo().catch(console.error)}
          >
            One Click Deployment
          </Button>
        )}
      </div>

      <Dialog open={deploymentModalOpen} onOpenChange={setDeploymentModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            {deploymentSteps.map((label, index) => (
              <div key={index} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full border-2',
                      deploymentProgress.step >= index
                        ? 'border-primary bg-primary text-white'
                        : 'border-muted-foreground/25'
                    )}
                  >
                    {deploymentProgress.step > index ? (
                      <Check className="size-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-center text-xs',
                      deploymentProgress.step >= index
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < deploymentSteps.length - 1 && (
                  <div
                    className={cn(
                      'mx-4 h-[2px] flex-1',
                      deploymentProgress.step > index
                        ? 'bg-primary'
                        : 'bg-muted-foreground/25'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <DialogHeader>
            <DialogTitle>Deploying</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {deploymentProgress.status.map((status, index) => (
              <div key={status} className="flex items-center gap-3">
                {deploymentProgress.step > index ? (
                  <div className="flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
                    <Check className="size-4 stroke-[3] text-white" />
                  </div>
                ) : deploymentProgress.step === index ? (
                  <div className="flex size-5 items-center justify-center">
                    <RotateCw className="size-4 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="size-5" />
                )}
                <span className="font-mono text-sm">
                  {format(new Date(), 'HH:mm:ss')} {status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded border bg-muted p-4 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Clock className="size-4 text-primary" />
              <span>Estimated time: 10 minutes</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="text-center sm:max-w-[500px]">
          <div className="my-6 flex justify-center">
            <div className="relative">
              <div className="size-24 rounded-full bg-primary">
                <Check className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white" />
              </div>
              <div className="absolute -inset-1">
                <div className="size-26 animate-spin-slow rounded-full bg-primary/20" />
              </div>
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Success!</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4 text-lg">
              Your Ollama app is installed. You have 1 hour to use your model.
            </p>
            <p className="text-sm text-muted-foreground">
              Auto redirect in {redirectCounter} seconds or view your
              deployments on{' '}
              <Link href="/dashboard" className="text-primary hover:underline">
                dashboard
              </Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
