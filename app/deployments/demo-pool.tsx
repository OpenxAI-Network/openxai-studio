'use client'

import { useDemosAvailable } from '@/lib/xnode-demo'
import { Clock, Check, Loader2, Cpu, MemoryStick, HardDrive } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export function DemoPool() {
  const { data: demoXnodes, isLoading } = useDemosAvailable()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span>Loading demo servers...</span>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Server ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>CPU Usage</TableHead>
          <TableHead>Memory</TableHead>
          <TableHead>Storage</TableHead>
          <TableHead>Reserved Until</TableHead>
          <TableHead>Next Reset</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {demoXnodes?.map((xnode) => {
          const isReserved = xnode.reservation !== undefined
          const isExpired = isReserved && 
            xnode.reservation?.reserved_until ? 
            xnode.reservation.reserved_until < Date.now() / 1000 : 
            false
          const timeLeft = isReserved && xnode.reservation?.reserved_until ? 
            Math.round((xnode.reservation.reserved_until - Date.now() / 1000) / 60) : 
            0

          // Calculate next reset time (45 mins after reservation)
          const resetTime = isReserved && xnode.reservation?.reserved_until ? 
            new Date(xnode.reservation.reserved_until * 1000 + 45 * 60 * 1000) :
            null

          return (
            <TableRow key={xnode.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {isReserved && !isExpired ? (
                    <Clock className="size-4 text-orange-500" />
                  ) : (
                    <Check className="size-4 text-green-500" />
                  )}
                  {xnode.id.split('-').pop()}
                </div>
              </TableCell>
              <TableCell>
                {isReserved && !isExpired ? (
                  <span className="text-orange-500">Reserved</span>
                ) : (
                  <span className="text-green-500">Available</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex w-full items-center gap-2">
                  <Cpu className="size-4 text-muted-foreground" />
                  <div className="relative h-2 w-24 rounded bg-border">
                    <div
                      className="absolute left-0 top-0 h-2 rounded bg-primary transition-all"
                      style={{
                        width: `${Math.min(Math.round(xnode.heartbeatData?.cpuPercent ?? 0), 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(xnode.heartbeatData?.cpuPercent ?? 0)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex w-full items-center gap-2">
                  <MemoryStick className="size-4 text-muted-foreground" />
                  <div className="relative h-2 w-24 rounded bg-border">
                    <div
                      className="absolute left-0 top-0 h-2 rounded bg-primary transition-all"
                      style={{
                        width: `${Math.min(((xnode.heartbeatData?.ramMbUsed ?? 0) / (xnode.heartbeatData?.ramMbTotal ?? 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((xnode.heartbeatData?.ramMbUsed ?? 0) / 1024)}GB/
                    {Math.round((xnode.heartbeatData?.ramMbTotal ?? 0) / 1024)}GB
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex w-full items-center gap-2">
                  <HardDrive className="size-4 text-muted-foreground" />
                  <div className="relative h-2 w-24 rounded bg-border">
                    <div
                      className="absolute left-0 top-0 h-2 rounded bg-primary transition-all"
                      style={{
                        width: `${Math.min(((xnode.heartbeatData?.storageMbUsed ?? 0) / (xnode.heartbeatData?.storageMbTotal ?? 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((xnode.heartbeatData?.storageMbUsed ?? 0) / 1024)}GB/
                    {Math.round((xnode.heartbeatData?.storageMbTotal ?? 0) / 1024)}GB
                  </span>
                </div>
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
                {resetTime ? (
                  <span className="text-muted-foreground">
                    {format(resetTime, 'HH:mm:ss')}
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
                  onClick={() => window.location.href = '/deploy/one-click'}
                >
                  {isReserved && !isExpired ? 'Reserved' : 'Deploy AI App'}
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
} 