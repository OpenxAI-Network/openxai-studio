"use client";

import { Ansi } from "@/components/ui/ansi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  X,
  ArrowLeft,
  Square,
  RefreshCw,
  Play,
} from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import { useRequestPopup } from "./request-popup";
import { Input } from "@/components/ui/input";

import {
  useProcessExecute,
  useProcessList,
  useProcessLogs,
} from "@openmesh-network/xnode-manager-sdk-react";

export interface ProcessesParams {
   session?: xnode.utils.Session;
  scope: string;
  open?: boolean;
  setOpen: (value: boolean) => void;
}

export function Processes({ session, scope, open, setOpen }: ProcessesParams) {
  return (
    // <Dialog>
    //   <DialogTrigger asChild>
    //     {/* Your custom button goes here */}
    //     <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md">
    //       Processes
    //     </button>
    //   </DialogTrigger>
    //   <DialogContent className="flex flex-col sm:max-w-7xl">
    //     <ProcessesInner {...params} />
    //   </DialogContent>
    // </Dialog>
     <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col sm:max-w-7xl">
        <ProcessesInner session={session} scope={scope} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

export function ProcessesInner({ session, scope }: ProcessesParams) {
  const setRequestPopup = useRequestPopup();
  const { mutate: execute } = useProcessExecute({
    overrides: {
      onSuccess({ request_id }) {
        setRequestPopup({ request_id });
      },
    },
  });

  const { data: processes } = useProcessList({
    session,
    scope,
  });
  const [currentProcess, setCurrentProcess] = useState<string | undefined>(
    undefined
  );
  const [startProcess, setStartProcess] = useState<string>("");

  const { data: currentProcessLogs } = useProcessLogs({
    session,
    scope,
    process: currentProcess,
  });
  const logsScrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollLogToBottom = useMemo(() => {
    return () => {
      const scrollArea = logsScrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    };
  }, [logsScrollAreaRef]);
  useEffect(() => {
    scrollLogToBottom();
  }, [currentProcessLogs, scrollLogToBottom]);

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
                      return -1;
                    }

                    if (p2.running && !p1.running) {
                      return 1;
                    }

                    return 0;
                  })
                  .map((p) => (
                    <Button
                      key={p.name}
                      variant="outline"
                      className="flex gap-2 justify-start"
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
                      data: "Start",
                    });
                    setStartProcess("");
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
            <div className="flex gap-5 place-items-center">
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
                            data: "Stop",
                          });
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
                            data: "Restart",
                          });
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
                          data: "Start",
                        });
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
                <ScrollArea className="rounded border bg-black h-[500px]">
                  <div className="px-3 py-2 font-mono text-muted flex flex-col">
                    {currentProcessLogs.map((log, i) =>
                      "UTF8" in log.message ? (
                        <span key={i}>{log.message.UTF8.output}</span>
                      ) : (
                        <Ansi key={i}>
                          {Buffer.from(log.message.Bytes.output).toString(
                            "utf-8"
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
  );
}