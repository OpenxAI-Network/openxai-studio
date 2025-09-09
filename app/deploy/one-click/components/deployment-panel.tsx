'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDemoContext, useSetDemoContext } from '@/contexts/XnodeDemoContext'
import ModelDefinitions from '@/utils/model-definitions.json'
import { xnode } from '@openmesh-network/xnode-manager-sdk'
import axios from 'axios'
import { Check } from 'lucide-react'
import { type SignMessageReturnType } from 'viem'
import { useAccount } from 'wagmi'
import { useLoading } from '@/contexts/LoadingContext'
import { cn } from '@/lib/utils'
import {
  demoSession,
  getFlake,
  reserveDemo,
  useDemosAvailable,
  useDeployModel,
  type DemoXnode,
} from '@/lib/xnode'
import { Button } from '@/components/ui/button'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { useToast } from '@/components/ui/use-toast'
import { useDeploymentQueueContext } from '@/components/deployment-queue'

import { DeploymentSignature } from '../../deployment-signature'
import { ERCOptions } from './erc-options'
import { ModelSizeSelector } from './model-size-selector'
import { ProviderSelector } from './provider-selector'

// Demo pool hardware specifications
const DEMO_POOL_SPECS = {
  cpuCores: 8, // 2 CPU cores
  memoryGB: 16, // 16GB RAM
  storageGB: 310, // 310GB Storage
} as const

export type Provider =
  | { type: 'demo' }
  | { type: 'xnode'; collection: string; chain: string; tokenId: string }

type DeploymentStep = {
  modelSize?: any
  provider?: Provider
  ercOption?: any
}

interface DeploymentPanelProps {
  templateId?: string
  app: string
}

export function DeploymentPanel({ templateId, app }: DeploymentPanelProps) {
  const router = useRouter()
  const [step, setStep] = useState<DeploymentStep>({})
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [deploying, setDeploying] = useState<boolean>(false)
  const { setLoading } = useLoading()
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
    // Only advance to step 1 if a model is selected, go back to step 0 if deselected
    setCurrentStep(model ? 1 : 0)
  }

  const handleProviderSelect = (provider: Provider | null) => {
    setStep((prev) => ({ ...prev, provider }))
    // Only advance to step 2 if a provider is selected, go back to step 1 if deselected
    setCurrentStep(provider ? 2 : 1)
  }

  const handleERCSelect = (ercOption: any) => {
    setStep((prev) => ({ ...prev, ercOption }))
    // Only advance to step 3 if an option is selected, go back to step 2 if deselected
    setCurrentStep(ercOption ? 3 : 2)
  }
  const { toast } = useToast()
  const demos = useDemosAvailable()
  const demoXnode = demos.data?.find((x) => !x.reservation)
  const reservedXnode = useDemoContext()
  const setReservedXnode = useSetDemoContext()
  const deployModel = useDeployModel()

  const deployOnDemo = async ({ signature }: { signature?: string }) => {
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

    try {
      if (activeReservation) {
        deployOnXnode = reservedXnode.xnode
      } else {
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
      await axios
        .post(
          'https://indexer.core.openxai.org/api/deployment_signature/upload',
          {
            xnode: session.baseUrl,
            app: `xnode-ai-chat:${app}`,
            version: modelSize,
            ...(signature && signature !== '0x'
              ? {
                deployer: address,
                signature,
              }
              : {}),
          }
        )
        .catch(console.error)
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
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const { addToQueue } = useDeploymentQueueContext()
  const deployOnXnode = async ({
    xnode,
    signature,
  }: {
    xnode: string
    signature?: string
  }) => {
    // Use templateId to find the correct model definition
    const selectedModel = ModelDefinitions.find((m) => m.nixName === templateId)
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

    await axios
      .post(
        'https://indexer.core.openxai.org/api/deployment_signature/upload',
        {
          xnode,
          app: `xnode-ai-chat:${app}`,
          version: modelSize,
          ...(signature && signature !== '0x'
            ? {
              deployer: address,
              signature,
            }
            : {}),
        }
      )
      .catch(console.error)

    addToQueue(xnode, {
      path: {
        container: 'xnode-ai-chat',
      },
      data: {
        settings: {
          flake: getFlake({ model: ollamaCommand, gpu: true }),
          network: 'containernet',
          nvidia_gpus: [0],
        },
        update_inputs: [],
      },
    })

    router.push(`/xnode?baseUrl=${xnode}`)
  }

  // Check if all selections are made
  const isReadyToDeploy = step.modelSize && step.provider && step.ercOption

  const { address } = useAccount()
  const [askSignature, setAskSignature] = useState<boolean>(false)

  return (
    <>

      <div className="flex flex-col space-y-8">
        <h2 className="text-xl font-semibold">One Click Deployment</h2>

        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Select your version</span>
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
              app={app}
            />
            {currentStep > 0 && step.modelSize && (
              <div className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-[#22C55E]">
                <Check className="size-4 stroke-[3] text-white" />
              </div>
            )}
          </div>
        </div>

        {currentStep >= 1 && (
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Select your host</span>
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
          </div>
        )}

        {currentStep >= 2 && (
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">
              Tokenization and Monetization
            </span>
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
          </div>
        )}

        {currentStep >= 2 && (
          <>
            <Button
              className="w-full"
              size="lg"
              disabled={!isReadyToDeploy || deploying}
              onClick={() => {
                setAskSignature(true)
              }}
            >
              One Click Deployment
            </Button>
          </>
        )}
      </div>
      <DeploymentSignature
        app={app}
        version={step.modelSize?.name}
        open={askSignature}
        close={(signature) => {
          setAskSignature(false)
          // if (signature !== undefined) {
          setLoading(true)
          setDeploying(true)
            ; (step.provider.type === 'demo'
              ? deployOnDemo({ signature })
              : deployOnXnode({
                xnode: `https://manager.${step.provider.tokenId}.${step.provider.chain}.${step.provider.collection}.openxai.network`,
                signature,
              })
          )
            .catch(console.error)
            .finally(() => setDeploying(false))
        // }
        }}
      />
    </>
  )
}
