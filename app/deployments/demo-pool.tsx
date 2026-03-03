'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useDemoContext } from '@/contexts/XnodeDemoContext'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import {
  useProcessLogs,
  useRequestCommandInfo,
  useRequestRequestInfo,
} from '@openmesh-network/xnode-manager-sdk-react'
import { Loader2 } from 'lucide-react'

import { useDemosAvailable, useDemoSession, type DemoXnode } from '@/lib/xnode'
import { Ansi } from '@/components/ui/ansi'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDeploymentQueueContext } from '@/components/deployment-queue'

export function DemoPool() {
  const { data: demoXnodes, isLoading } = useDemosAvailable()
  const { setDeploymentComplete } = useDeploymentQueueContext()
  let { xnode: reservedXnode, deploymentId, processes } = useDemoContext()
  if (reservedXnode?.reservation?.reserved_until < Date.now() / 1000) {
    reservedXnode = undefined
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span>Loading demo servers...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reservedXnode && (
        <ReservedDemoXnode
          xnode_id={reservedXnode?.id}
          request_id={deploymentId}
          processes={processes}
          onDeploymentComplete={setDeploymentComplete}
        />
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Server ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reserved Until</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {demoXnodes?.map((xnode, i) => (
            <DemoXnodeListing
              key={xnode.id}
              xnode={xnode}
              reservedXnode={reservedXnode}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ReservedDemoXnode({
  xnode_id,
  request_id,
  processes,
  onDeploymentComplete,
}: {
  xnode_id?: string
  request_id?: xnode.request.RequestId
  processes: string[]
  onDeploymentComplete: (complete: boolean) => void
}) {
  const session = useDemoSession({ xnode_id })
  const { data: deployment } = useRequestRequestInfo({
    session,
    request_id,
  })

  return (
    <div className="flex flex-col gap-1">
      <span className="text-lg font-semibold">Your demo node</span>
      {deployment &&
        (deployment.result ? (
          <ReservedDemoXnodeReady
            session={session}
            processes={processes}
            onDeploymentComplete={onDeploymentComplete}
          />
        ) : (
          <ReservedDemoXnodeDeployingCommand
            session={session}
            request_id={request_id}
            command={deployment.commands.at(-1)}
          />
        ))}
    </div>
  )
}

function ReservedDemoXnodeReady({
  session,
  processes,
  onDeploymentComplete,
}: {
  session?: xnode.utils.Session
  processes?: string[]
  onDeploymentComplete: (complete: boolean) => void
}) {
  const [selectedProcess, setSelectedProcess] = useState(processes?.at(0))
  const { data: logs } = useProcessLogs({
    session,
    scope: 'container:xnode-ai-chat',
    process: `${selectedProcess}.service`,
  })

  const [hasTriggered, setHasTriggered] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = useMemo(() => {
    return () => {
      const scrollArea = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }, [scrollAreaRef])

  useEffect(() => {
    scrollToBottom()
  }, [logs, scrollToBottom])

  const { data: openWebUI } = useProcessLogs({
    session,
    scope: 'container:xnode-ai-chat',
    process: `open-webui.service`,
    overrides: {
      enabled: processes !== undefined && processes.includes('open-webui'),
    },
  })

  const { data: ollamaModelLoader, dataUpdatedAt: ollamaModelLoaderUpdate } =
    useProcessLogs({
      session,
      scope: 'container:xnode-ai-chat',
      process: `ollama-model-loader.service`,
      overrides: {
        enabled:
          processes !== undefined && processes.includes('ollama-model-loader'),
      },
    })

  const appPrepare = useMemo(() => {
    const waitingFor = []
    if (processes === undefined) {
      return { waitingFor: ['processes'] }
    }

    if (
      processes.includes('open-webui') &&
      (openWebUI === undefined ||
        (openWebUI.length < 100 && // More logs can cause the desired message to disappear
          !openWebUI.some(
            (log) =>
              'UTF8' in log.message &&
              log.message.UTF8.output.includes(
                'Waiting for application startup.'
              )
          )))
    ) {
      waitingFor.push('open-webui')
    }

    if (
      processes.includes('ollama-model-loader') &&
      (ollamaModelLoader === undefined ||
        Date.now() - ollamaModelLoaderUpdate > 10_000 || // outdated
        !ollamaModelLoader.some(
          (log, i) =>
            i === ollamaModelLoader.length - 1 && // Changing model on deployment will restart the model loader, only consider last message
            'Bytes' in log.message &&
            new TextDecoder('utf-8')
              .decode(new Uint8Array(log.message.Bytes.output))
              .includes('success')
        ))
    ) {
      waitingFor.push('ollama-model-loader')
    }

    if (waitingFor.length === 0 && !hasTriggered) {
      setHasTriggered(true)
      onDeploymentComplete(true)
    }
    return { waitingFor }
  }, [processes, openWebUI, ollamaModelLoader, ollamaModelLoaderUpdate])

  return (
    <div className="flex flex-col gap-1">
      {appPrepare.waitingFor.length > 0 ? (
        <div className="flex gap-4">
          {appPrepare.waitingFor.map((app, i) => (
            <div className="flex place-items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-b-2 border-black" />
              <span key={i}>
                {app === 'open-webui'
                  ? 'Preparing web interface'
                  : app === 'ollama-model-loader'
                    ? 'Downloading LLM model'
                    : ''}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Button variant="outlinePrimary" className="max-w-32" asChild>
          <Link href={session.baseUrl.replace('manager.', '')} target="_blank">
            Go To App
          </Link>
        </Button>
      )}
      <div className="flex flex-col">
        <div className="flex">
          {processes?.map((process) => (
            <Button
              key={process}
              className="w-full"
              onClick={() => setSelectedProcess(process)}
              disabled={process === selectedProcess}
            >
              {process}
            </Button>
          ))}
        </div>
        <div ref={scrollAreaRef}>
          <ScrollArea className="h-[500px] rounded border bg-black">
            <div className="flex flex-col px-3 py-2 font-mono text-muted">
              {logs?.map((log, i) =>
                'UTF8' in log.message ? (
                  <span key={i}>{log.message.UTF8.output}</span>
                ) : (
                  <Ansi key={i}>
                    {Buffer.from(log.message.Bytes.output).toString('utf-8')}
                  </Ansi>
                )
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

function ReservedDemoXnodeDeployingCommand({
  session,
  request_id,
  command,
}: {
  session?: xnode.utils.Session
  request_id?: xnode.request.RequestId
  command?: string
}) {
  const { data: commandInfo } = useRequestCommandInfo({
    session,
    request_id,
    command,
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = useMemo(() => {
    return () => {
      const scrollArea = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }, [scrollAreaRef])
  useEffect(() => {
    scrollToBottom()
  }, [commandInfo?.stderr, scrollToBottom])

  return (
    commandInfo && (
      <div className="flex flex-col gap-1">
        <span>Executing: {commandInfo.command}</span>
        <div ref={scrollAreaRef}>
          <ScrollArea className="h-[500px] rounded border bg-black">
            <div className="flex flex-col px-3 py-2 font-mono text-muted">
              {'UTF8' in commandInfo.stderr
                ? commandInfo.stderr.UTF8.output
                    .split('\n')
                    .map((line, i) => <span key={i}>{line}</span>)
                : Buffer.from(commandInfo.stderr.Bytes.output)
                    .toString('utf-8')
                    .split('\n')
                    .map((line, i) => <Ansi key={i}>{line}</Ansi>)}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  )
}

function DemoXnodeListing({
  xnode,
  reservedXnode,
}: {
  xnode: DemoXnode
  reservedXnode?: DemoXnode
}) {
  const isReserved = !!xnode.reservation
  const timeLeft = isReserved
    ? Math.round((xnode.reservation.reserved_until - Date.now() / 1000) / 60)
    : 0
  const isExpired = timeLeft < 0

  return (
    <TableRow>
      <TableCell className="font-medium">
        {xnode.id.replace('manager.', '').split('-').at(0)}
      </TableCell>
      <TableCell>
        {reservedXnode && reservedXnode.id === xnode.id ? (
          <Link
            className="text-blue-500"
            href={`https://${xnode.id.replace('manager.', '')}`}
            target="_blank"
          >
            Reserved by you
          </Link>
        ) : isReserved && !isExpired ? (
          <span className="text-orange-500">Reserved</span>
        ) : (
          <span className="text-green-500">Available</span>
        )}
      </TableCell>
      <TableCell>
        {isReserved && !isExpired && timeLeft > 0 ? (
          <span className="text-muted-foreground">
            {timeLeft} minutes remaining
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          disabled={isReserved && !isExpired}
          asChild
        >
          {isReserved && !isExpired ? (
            <span>Reserved</span>
          ) : (
            <Link href="/app-store">Deploy AI App</Link>
          )}
        </Button>
      </TableCell>
    </TableRow>
  )
}
