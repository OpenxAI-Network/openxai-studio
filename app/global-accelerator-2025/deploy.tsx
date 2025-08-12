'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDemoContext, useSetDemoContext } from '@/contexts/XnodeDemoContext'
import { xnode } from '@openmesh-network/xnode-manager-sdk'

import {
  globalaccelerator2025templates,
  useDeployDemo,
} from '@/lib/global-accelerator-2025'
import {
  demoSession,
  reserveDemo,
  useDemosAvailable,
  type DemoXnode,
} from '@/lib/xnode'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export function GlobalAccelerator2025Deploy() {
  const [template, setTemplate] = useState<string>(
    globalaccelerator2025templates[0].name
  )

  const router = useRouter()
  const { toast } = useToast()
  const demos = useDemosAvailable()
  const demoXnode = demos.data?.find((x) => !x.reservation)
  const reservedXnode = useDemoContext()
  const setReservedXnode = useSetDemoContext()
  const deployDemo = useDeployDemo()

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

      const toDeploy = globalaccelerator2025templates.find(
        (t) => t.name === template
      )
      if (!toDeploy) {
        return
      }

      const deploymentId = await deployDemo({
        session,
        ...toDeploy,
      }).then((data) => data.request_id)
      setReservedXnode({
        xnode: deployOnXnode,
        deploymentId,
        processes: [toDeploy.name, 'ollama', 'ollama-model-loader'],
      })

      router.push('/deployments')
    } catch (e) {
      console.error(e)
    } finally {
      dismiss()
    }
  }

  return (
    <div className="flex gap-3">
      <Select value={template} onValueChange={(v) => setTemplate(v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Demo" />
        </SelectTrigger>
        <SelectContent>
          {globalaccelerator2025templates.map((template) => (
            <SelectItem key={template.name} value={template.name}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={() => deployOnDemo().catch(console.error)}>
        Deploy
      </Button>
    </div>
  )
}
