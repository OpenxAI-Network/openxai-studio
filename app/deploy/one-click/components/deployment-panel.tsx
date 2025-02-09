'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ModelSizeSelector } from './model-size-selector'
import { ProviderSelector } from './provider-selector'
import { ERCOptions } from './erc-options'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

type DeploymentStep = {
  modelSize?: any
  provider?: any
  ercOption?: any
}

export function DeploymentPanel() {
  const [step, setStep] = useState<DeploymentStep>({})
  const [currentStep, setCurrentStep] = useState<number>(0)

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

  const handleDeploy = async () => {
    // Implement deployment logic here
    console.log('Deploying with config:', step)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">One Click Deployment</h2>

      <div className={cn(
        "relative rounded-lg border",
        currentStep > 0 && "border-primary bg-primary/5"
      )}>
        <ModelSizeSelector 
          selected={step.modelSize}
          onSelect={handleModelSelect} 
        />
        {currentStep > 0 && step.modelSize && (
          <div className="absolute right-[-10] top-[-10] flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
            <Check className="size-4 stroke-[3] text-white" />
          </div>
        )}
      </div>
      
      {currentStep >= 1 && (
        <div className={cn(
          "relative rounded-lg border",
          currentStep > 1 && "border-primary bg-primary/5"
        )}>
          <ProviderSelector
            selected={step.provider}
            onSelect={handleProviderSelect}
          />
          {currentStep > 1 && (
            <div className="absolute right-[-10] top-[-10] flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
              <Check className="size-4 stroke-[3] text-white" />
            </div>
          )}
        </div>
      )}
      
      {currentStep >= 2 && (
        <div className={cn(
          "relative rounded-lg border",
          currentStep > 2 && "border-primary bg-primary/5"
        )}>
          <ERCOptions 
            selected={step.ercOption}
            onSelect={handleERCSelect} 
          />
          {currentStep > 2 && (
            <div className="absolute right-[-10] top-[-10] flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
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
  )
}