'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { xnode } from '@openmesh-network/xnode-manager-sdk'
import {
  useProcessExecute,
  useProcessList,
  useProcessLogs,
} from '@openmesh-network/xnode-manager-sdk-react'
import {
  ArrowLeft,
  CheckCircle,
  Play,
  RefreshCw,
  Square,
  X,
} from 'lucide-react'

import { Ansi } from '@/components/ui/ansi'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useRequestPopup } from '../request-popup'

export interface ProcessesParams {
  session?: xnode.utils.Session
  scope: string
}

export function Processes(params: ProcessesParams) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center justify-center rounded-md border border-[#525252] px-10 py-2 text-[10px] font-[500] text-[#525252] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px]">
          Processes
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-7xl">
        <ProcessesInner {...params} />
      </DialogContent>
    </Dialog>
  )
}

export function ProcessesInner({ session, scope }: ProcessesParams) {
  const setRequestPopup = useRequestPopup()
  const { mutate: execute } = useProcessExecute({
    overrides: {
      onSuccess({ request_id }) {
        setRequestPopup({ request_id })
      },
    },
  })

  const { data: processes } = useProcessList({
    session,
    scope,
  })
  const [currentProcess, setCurrentProcess] = useState<string | undefined>(
    undefined
  )
  const [startProcess, setStartProcess] = useState<string>('')

  const { data: currentProcessLogs } = useProcessLogs({
    session,
    scope,
    process: currentProcess,
  })
  const logsScrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollLogToBottom = useMemo(() => {
    return () => {
      const scrollArea = logsScrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }, [logsScrollAreaRef])
  useEffect(() => {
    scrollLogToBottom()
  }, [currentProcessLogs, scrollLogToBottom])

  return (
    <>
      <DialogHeader>
        <DialogTitle>{scope} processes</DialogTitle>
        <DialogDescription>
          Inspect and manage processes running in {scope}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        {processes && !currentProcess && (
          <>
            <ScrollArea className="h-[700px]">
              <div className="flex flex-col">
                {processes
                  .sort((p1, p2) => {
                    if (p1.running && !p2.running) {
                      return -1
                    }

                    if (p2.running && !p1.running) {
                      return 1
                    }

                    return 0
                  })
                  .map((p) => (
                    <Button
                      key={p.name}
                      variant="outline"
                      className="flex justify-start gap-2"
                      onClick={() => setCurrentProcess(p.name)}
                    >
                      {p.running ? <CheckCircle /> : <X />}
                      <span>
                        {p.name}: {p.description}
                      </span>
                    </Button>
                  ))}
              </div>
            </ScrollArea>
            {session && (
              <div className="flex gap-1">
                <Input
                  value={startProcess}
                  onChange={(e) => setStartProcess(e.target.value)}
                />
                <Button
                  className="flex gap-1"
                  onClick={() => {
                    execute({
                      session,
                      path: { scope, process: startProcess },
                      data: 'Start',
                    })
                    setStartProcess('')
                  }}
                >
                  <Play />
                  <span>Start</span>
                </Button>
              </div>
            )}
          </>
        )}
        {currentProcess && (
          <div className="flex flex-col gap-3">
            <div className="flex place-items-center gap-5">
              <Button
                className="flex gap-2"
                onClick={() => setCurrentProcess(undefined)}
              >
                <ArrowLeft />
                <span>Back</span>
              </Button>
              <span className="text-lg">{currentProcess}</span>
              <div className="grow" />
              {session && (
                <div className="flex gap-1">
                  {processes?.find((p) => p.name === currentProcess)
                    ?.running ? (
                    <>
                      <Button
                        className="flex gap-1"
                        onClick={() => {
                          execute({
                            session,
                            path: { scope, process: currentProcess },
                            data: 'Stop',
                          })
                        }}
                      >
                        <Square />
                        <span>Stop</span>
                      </Button>
                      <Button
                        className="flex gap-1"
                        onClick={() => {
                          execute({
                            session,
                            path: { scope, process: currentProcess },
                            data: 'Restart',
                          })
                        }}
                      >
                        <RefreshCw />
                        <span>Restart</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="flex gap-1"
                      onClick={() => {
                        execute({
                          session,
                          path: { scope, process: currentProcess },
                          data: 'Start',
                        })
                      }}
                    >
                      <Play />
                      <span>Start</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
            {currentProcessLogs && (
              <div ref={logsScrollAreaRef}>
                <ScrollArea className="h-[500px] rounded border bg-black">
                  <div className="flex flex-col px-3 py-2 font-mono text-muted">
                    {currentProcessLogs.map((log, i) =>
                      'UTF8' in log.message ? (
                        <span key={i}>{log.message.UTF8.output}</span>
                      ) : (
                        <Ansi key={i}>
                          {Buffer.from(log.message.Bytes.output).toString(
                            'utf-8'
                          )}
                        </Ansi>
                      )
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
