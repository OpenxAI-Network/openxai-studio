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

export function DemoPool() {
  const { data: demoXnodes, isLoading } = useDemosAvailable()

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
}: {
  xnode_id?: string
  request_id?: xnode.request.RequestId
  processes: string[]
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
          <ReservedDemoXnodeReady session={session} processes={processes} />
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
}: {
  session?: xnode.utils.Session
  processes?: string[]
}) {
  const [selectedProcess, setSelectedProcess] = useState(processes?.at(0))

  const { data: logs } = useProcessLogs({
    session,
    scope: 'container:xnode-ai-chat',
    process: `${selectedProcess}.service`,
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
  }, [logs, scrollToBottom])

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outlinePrimary" className="max-w-32" asChild>
        <Link href={session.baseUrl.replace('manager.', '')} target="_blank">
          Go To App
        </Link>
      </Button>
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
