'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { xnode } from '@openmesh-network/xnode-manager-sdk'
import {
  useRequestCommandInfo,
  useRequestRequestInfo,
} from '@openmesh-network/xnode-manager-sdk-react'
import { CheckCircle, Hourglass, X } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Ansi } from '../ui/ansi'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'

export interface RequestPopup {
  request_id?: number
  onFinish?: (result: xnode.request.RequestInfo['result']) => void
}
const defaultRequestPopup: RequestPopup = {}
const SetRequestPopupContext = createContext<
  (requestPopup: RequestPopup) => void
>(() => {})

export function RequestPopupProvider({
  session,
  children,
}: {
  session?: xnode.utils.Session
  children: React.ReactNode
}) {
  const [requestPopup, setRequestPopup] =
    useState<RequestPopup>(defaultRequestPopup)
  const [selectedCommand, setSelectedCommand] = useState<string | undefined>(
    undefined
  )

  const { data: requestInfo } = useRequestRequestInfo({
    session,
    request_id: requestPopup.request_id,
  })

  const close = useMemo(() => {
    return (
      requestPopup: RequestPopup,
      result: xnode.request.RequestInfo['result']
    ) => {
      requestPopup.onFinish?.(result)
      setRequestPopup({})
    }
  }, [])

  useEffect(() => {
    setSelectedCommand(requestInfo?.commands.at(-1))
  }, [requestInfo?.commands])

  useEffect(() => {
    if (requestInfo && requestInfo.result && 'Success' in requestInfo.result) {
      close(requestPopup, requestInfo.result)
    }
  }, [requestPopup, requestInfo])

  return (
    <SetRequestPopupContext.Provider value={setRequestPopup}>
      {children}
      <AlertDialog open={requestPopup.request_id !== undefined}>
        <AlertDialogContent className="flex flex-col sm:max-w-7xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Request {requestPopup.request_id}
            </AlertDialogTitle>
            <AlertDialogDescription>
              View live request progress. This popup will automatically close
              once the request completed successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {requestInfo && (
            <div className="flex flex-col">
              <Accordion
                type="single"
                value={selectedCommand}
                onValueChange={(c) => setSelectedCommand(c)}
                collapsible
              >
                {requestInfo.commands.map((command) => (
                  <RequestCommand
                    key={command}
                    session={session}
                    request_id={requestPopup.request_id}
                    command={command}
                  />
                ))}
              </Accordion>
              {requestInfo.result && (
                <AlertDialogFooter>
                  <Button
                    onClick={() => {
                      close(requestPopup, requestInfo.result)
                    }}
                  >
                    Close
                  </Button>
                </AlertDialogFooter>
              )}
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </SetRequestPopupContext.Provider>
  )
}

export function RequestCommand({
  session,
  request_id,
  command,
}: {
  session?: xnode.utils.Session
  request_id?: number
  command: string
}) {
  const { data: commandInfo } = useRequestCommandInfo({
    session,
    request_id,
    command,
  })

  const errScrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollErrToBottom = useMemo(() => {
    return () => {
      const scrollArea = errScrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }, [errScrollAreaRef])
  useEffect(() => {
    scrollErrToBottom()
  }, [commandInfo?.stderr, scrollErrToBottom])

  return (
    commandInfo && (
      <AccordionItem value={command}>
        <AccordionTrigger>
          <div className="flex place-content-center gap-2">
            {commandInfo.result === '0' ? (
              <CheckCircle className="shrink-0 text-green-600" />
            ) : commandInfo.result === '1' ? (
              <X className="shrink-0 text-red-600" />
            ) : (
              <Hourglass className="shrink-0" />
            )}
            <span>{commandInfo.command}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div ref={errScrollAreaRef}>
            <ScrollArea className="h-[500px] rounded border bg-black">
              <div className="flex flex-col px-3 py-2 font-mono text-muted">
                {'UTF8' in commandInfo.stderr ? (
                  commandInfo.stderr.UTF8.output
                    .split('\n')
                    .map((line, i) => <span key={i}>{line}</span>)
                ) : (
                  <Ansi>
                    {Buffer.from(commandInfo.stderr.Bytes.output).toString(
                      'utf-8'
                    )}
                  </Ansi>
                )}
              </div>
            </ScrollArea>
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  )
}

export function useRequestPopup() {
  return useContext(SetRequestPopupContext)
}
