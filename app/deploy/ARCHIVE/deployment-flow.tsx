'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Check,
  Database,
  IdCard,
  MapPin,
  RotateCw,
  ServerCog,
} from 'lucide-react'

import {
  type AppStoreItem,
  type AppStorePageType,
  type Specs,
} from '@/types/dataProvider'
import { cn, formatSelectedXNodeName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupCard } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useDemoModeContext } from '@/components/demo-mode'
import { useSelectedXNode } from '@/components/selected-xnode'

import { useXnodes } from '../../dashboard/health-data'
import { useDeploymentContext } from '../deployment-context'
import DeploymentProvider from '../deployment-provider'

type Step = 0 | 1 | 2
type FlowType = 'xnode-current' | 'xnode-new' | 'baremetal' | 'evp'
type DeploymentStep = 'Choose Provider' | 'Configure' | 'Deploy'

type DeploymentFlowProps = {
  sessionToken: string
  item: AppStoreItem
  specs?: Specs
  type: AppStorePageType
}

export function DeploymentFlow({
  sessionToken,
  type,
  item,
  specs,
}: DeploymentFlowProps) {
  const { demoMode } = useDemoModeContext()
  const router = useRouter()
  const { selectedXNode } = useSelectedXNode()
  const { data: deployedXNodes } = useXnodes(sessionToken)
  const { config, provider } = useDeploymentContext()

  const [step, setStep] = useState<Step>(0)
  const [flowType, setFlowType] = useState<FlowType | undefined>()
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStep>('Choose Provider')
  const [isDeploying, setIsDeploying] = useState(false)

  // Reuse existing deployment logic
  const deployedXNode = useMemo(() => {
    if (!selectedXNode || !deployedXNodes) return undefined

    return selectedXNode.type === 'Custom'
      ? deployedXNodes.find((xNode) => xNode.id === selectedXNode.id)
      : deployedXNodes.find(
          (xNode) => xNode.deploymentAuth === selectedXNode.id.toString()
        )
  }, [selectedXNode, deployedXNodes])

  async function handleDeploy() {
    setIsDeploying(true)
    setDeploymentStatus('Deploy')
    
    try {
      if (flowType === 'xnode-current') {
        // Reference existing createXNodeDeployment logic
        startLine: 245
        endLine: 307
      } else if (flowType === 'baremetal') {
        // Reference existing externalXnodeDeployment logic
        startLine: 309
        endLine: 380
      }
      
      router.push('/deployments')
    } catch (error) {
      setIsDeploying(false)
      setDeploymentStatus('Configure')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {step === 0 && (
        <RadioGroup
          value={flowType ?? ''}
          onValueChange={(type: FlowType) => setFlowType(type)}
          className="flex flex-col gap-4"
        >
          {selectedXNode && (
            <RadioGroupCard value="xnode-current">
              <div className="flex items-center gap-3">
                <IdCard className="size-8 text-primary" strokeWidth={1.25} />
                <div>
                  <h3 className="text-xl font-semibold">
                    {formatSelectedXNodeName(selectedXNode)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add an app to your existing Xnode
                  </p>
                </div>
              </div>
            </RadioGroupCard>
          )}

          <RadioGroupCard value="baremetal">
            <div className="flex items-center gap-3">
              <ServerCog className="size-8 text-primary" strokeWidth={1.25} />
              <div>
                <h3 className="text-xl font-semibold">Baremetal</h3>
                <p className="text-sm text-muted-foreground">
                  Deploy on a dedicated high-performance machine
                </p>
              </div>
            </div>
          </RadioGroupCard>

          <RadioGroupCard value="evp" disabled>
            <div className="flex items-center gap-3">
              <Database className="size-8 text-primary" strokeWidth={1.25} />
              <div>
                <h3 className="text-xl font-semibold">Early Validator</h3>
                <p className="text-sm text-muted-foreground">
                  Deploy with your Early Node Validator Pass
                </p>
              </div>
            </div>
          </RadioGroupCard>
        </RadioGroup>
      )}

      {step === 1 && flowType === 'baremetal' && (
        <DeploymentProvider 
          specs={specs}
          onSelect={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>{config.location}</span>
          </div>
          
          {/* Provider details */}
          {provider && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Selected Configuration</h4>
                <div className="rounded-lg border p-4 text-sm">
                  {/* Reuse baremetalConfig logic */}
                  startLine: 127
                  endLine: 169
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-auto flex justify-between">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => (s - 1) as Step)}
          >
            Back
          </Button>
        )}
        
        <Button
          className="ml-auto"
          disabled={!flowType || isDeploying}
          onClick={() => {
            if (step === 2) {
              handleDeploy()
            } else {
              setStep((s) => (s + 1) as Step)
            }
          }}
        >
          {isDeploying ? (
            <>
              <RotateCw className="mr-2 size-4 animate-spin" />
              Deploying...
            </>
          ) : step === 2 ? (
            'Deploy'
          ) : (
            'Next'
          )}
        </Button>
      </div>

      {isDeploying && (
        <div className="mt-4 rounded border bg-muted p-4 text-sm">
          <p className="font-mono">
            <span className="opacity-75">[{format(new Date(), 'HH:mm:ss')}]</span>{' '}
            Deploying your configuration...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Check className="size-4 text-primary" />
            <span>Estimated time: {provider?.type === 'Bare Metal' ? '30' : '10'} minutes</span>
          </div>
        </div>
      )}
    </div>
  )
} 