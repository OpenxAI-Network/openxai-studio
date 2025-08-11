'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDemoContext, useSetDemoContext } from '@/contexts/XnodeDemoContext'
import ModelDefinitions from '@/utils/model-definitions.json'
import { xnode } from '@openmesh-network/xnode-manager-sdk'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  demoSession,
  reserveDemo,
  useDemosAvailable,
  useDeployModel,
  type DemoXnode,
} from '@/lib/xnode-demo'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

import { ERCOptions } from './erc-options'
import { ModelSizeSelector } from './model-size-selector'
import { ProviderSelector } from './provider-selector'

// Demo pool hardware specifications
const DEMO_POOL_SPECS = {
  cpuCores: 8, // 2 CPU cores
  memoryGB: 16, // 16GB RAM
  storageGB: 310, // 310GB Storage
} as const

type DeploymentStep = {
  modelSize?: any
  provider?: string
  ercOption?: any
}

interface DeploymentPanelProps {
  templateId?: string
}

export function DeploymentPanel({ templateId }: DeploymentPanelProps) {
  const router = useRouter()
  const [step, setStep] = useState<DeploymentStep>({})
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [deploying, setDeploying] = useState<boolean>(false)

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

  const handleProviderSelect = (provider: string) => {
    setStep((prev) => ({ ...prev, provider }))
    setCurrentStep(2)
  }

  const handleERCSelect = (ercOption: any) => {
    setStep((prev) => ({ ...prev, ercOption }))
    setCurrentStep(3)
  }

  const { toast } = useToast()

  const demos = useDemosAvailable()
  const demoXnode = demos.data?.find((x) => !x.reservation)
  const reservedXnode = useDemoContext()
  const setReservedXnode = useSetDemoContext()
  const deployModel = useDeployModel()

  const deployOnDemo = async () => {
    const activeReservation =
      reservedXnode.xnode &&
      reservedXnode.xnode.reservation.reserved_until > Date.now() / 1000
    let deployOnXnode: DemoXnode

    if (!activeReservation && !demoXnode) {
      const nextFreeXnode = demos.data
        ?.map((x) => x.reservation.reserved_until)
        .sort()
        .at(0)
      toast({
        title: 'Deployment failed',
        description: `No demo xnodes available. ${nextFreeXnode ? `Next xnode will be free in ${Math.round((nextFreeXnode - Date.now() / 1000) / 60)} minutes.` : ''}`,
        variant: 'destructive',
      })
      return
    }

    let dismiss = () => {}
    try {
      if (activeReservation) {
        deployOnXnode = reservedXnode.xnode
      } else {
        dismiss = toast({
          title: 'Reserving Xnode...',
          description: 'This can take up to 1 minute..',
          duration: 60_000,
        }).dismiss
        deployOnXnode = await reserveDemo({ xnode_id: demoXnode.id })
      }

      console.log('Selected model:', step.modelSize)

      // Use templateId to find the correct model definition
      const selectedModel = ModelDefinitions.find(
        (m) => m.nixName === templateId
      )
      console.log('Found model definition:', selectedModel)

      // Get the selected size from the UI
      const modelSize = step.modelSize?.name
      console.log('Model size:', modelSize)

      const ollamaCommand =
        selectedModel?.options[0].requirements[modelSize]?.ollamaCommand
      console.log('Ollama command:', ollamaCommand)

      if (!ollamaCommand) {
        throw new Error('Selected model configuration not found')
      }

      const session = demoSession({ xnode_id: deployOnXnode.id })
      while (true) {
        // Wait until access is granted
        try {
          await xnode.usage.cpu({
            session,
            path: {
              scope: 'host',
            },
          })
          break
        } catch (e) {
          console.log('waiting for Xnode access...')
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      const deploymentId = await deployModel({
        session,
        model: ollamaCommand,
      }).then((data) => data.request_id)
      setReservedXnode({
        xnode: deployOnXnode,
        deploymentId,
        processes: ['open-webui', 'ollama', 'ollama-model-loader'],
      })

      router.push('/deployments')
    } catch (e) {
      console.error(e)
    } finally {
      dismiss()
    }
  }

  // Check if all selections are made
  const isReadyToDeploy = step.modelSize && step.provider && step.ercOption

  return (
    <>
      <div className="space-y-8">
        <h2 className="text-xl font-semibold">One Click Deployment</h2>

        <div
          className={cn(
            'relative cursor-pointer rounded-lg',
            currentStep > 0 && 'bg-primary/5'
          )}
          onClick={handleModelClick}
        >
          <ModelSizeSelector
            selected={step.modelSize}
            showAll={currentStep === 0}
            hardware={DEMO_POOL_SPECS}
            onSelect={handleModelSelect}
            templateId={templateId}
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
              'relative cursor-pointer rounded-lg',
              currentStep > 1 && 'bg-primary/5'
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
              'relative cursor-pointer rounded-lg',
              currentStep > 2 && 'bg-primary/5'
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
          <>
            <Button
              className="w-full"
              size="lg"
              disabled={!isReadyToDeploy || deploying}
              onClick={() => {
                setDeploying(true)
                deployOnDemo()
                  .catch(console.error)
                  .finally(() => setDeploying(false))
              }}
            >
              One Click Deployment
            </Button>
          </>
        )}
      </div>
    </>
  )
}
