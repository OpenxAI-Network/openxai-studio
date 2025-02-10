'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ModelSizeSelector } from './model-size-selector'
import { ProviderSelector } from './provider-selector'
import { ERCOptions } from './erc-options'
import { cn } from '@/lib/utils'
import { Check, RotateCw, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableHeader, TableBody, TableHead, TableRow } from '@/components/ui/table'
import { RefreshCcw } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    step: number;
    status: string[];
  }>({ step: 0, status: [] })

  const deploymentSteps = [
    'Model is selected',
    'Infrastructure activated',
    'Deploying your service'
  ]

  const handleModelSelect = (model: any) => {
    setStep(prev => ({ ...prev, modelSize: model }))
    setCurrentStep(1)
  }

  const handleProviderSelect = (provider: any) => {
    setStep(prev => ({ ...prev, provider }))
    setCurrentStep(2)
  }

  const handleERCSelect = (ercOption: any) => {
    setStep(prev => ({ ...prev, ercOption }))
    setCurrentStep(3)
  }

  const handleModelClick = () => {
    if (step.modelSize) setCurrentStep(0)
  }

  const handleProviderClick = () => {
    if (step.provider) setCurrentStep(1)
  }

  const handleERCClick = () => {
    if (step.ercOption) setCurrentStep(2)
  }

  const handleDeploy = async () => {
    setDeploymentModalOpen(true)
    setDeploymentProgress({
      step: 0,
      status: ['Preparing to deploy on XnodeG 001', 'Installing Ollama 3.1', 'Installing WebUI...']
    })
    
    // Simulate deployment progress
    setTimeout(() => {
      setDeploymentProgress(prev => ({ ...prev, step: 1 }))
      setTimeout(() => {
        setDeploymentProgress(prev => ({ ...prev, step: 2 }))
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

  return (
    <>
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">One Click Deployment</h2>

        <div 
          className={cn(
            "relative cursor-pointer rounded-lg border",
            currentStep > 0 && "border-primary bg-primary/5"
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
              "relative cursor-pointer rounded-lg border",
              currentStep > 1 && "border-primary bg-primary/5"
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
              "relative cursor-pointer rounded-lg border",
              currentStep > 2 && "border-primary bg-primary/5"
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
            onClick={handleDeploy}
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
                  <div className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2",
                    deploymentProgress.step >= index 
                      ? "border-primary bg-primary text-white" 
                      : "border-muted-foreground/25"
                  )}>
                    {deploymentProgress.step > index ? (
                      <Check className="size-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "mt-2 text-center text-xs",
                    deploymentProgress.step >= index 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </div>
                {index < deploymentSteps.length - 1 && (
                  <div className={cn(
                    "h-[2px] flex-1 mx-4",
                    deploymentProgress.step > index 
                      ? "bg-primary" 
                      : "bg-muted-foreground/25"
                  )} />
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
                    <Check className="size-4 text-white stroke-[3]" />
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
        <DialogContent className="sm:max-w-[500px] text-center">
          <div className="my-6 flex justify-center">
            <div className="relative">
              <div className="size-24 rounded-full bg-primary">
                <Check className="size-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
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
              Auto redirect in {redirectCounter} seconds or view your deployments on{' '}
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