'use client'

import Link from 'next/link'
import { useDemoContext } from '@/contexts/XnodeDemoContext'
import { format } from 'date-fns'
import {
  Check,
  Clock,
  Cpu,
  HardDrive,
  Loader2,
  MemoryStick,
} from 'lucide-react'

import {
  useDemoCPUUsage,
  useDemoDiskUsage,
  useDemoMemoryUsage,
  useDemosAvailable,
  type PublicDemoXnode,
} from '@/lib/xnode-demo'
import { Button } from '@/components/ui/button'
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
          {/* <TableHead>CPU Usage</TableHead> */}
          <TableHead>Memory</TableHead>
          <TableHead>Storage</TableHead>
          <TableHead>Reserved Until</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {demoXnodes?.map((xnode, i) => (
          <DemoXnodeListing key={xnode.id} {...xnode} />
        ))}
      </TableBody>
    </Table>
  )
}

function DemoXnodeListing(xnode: PublicDemoXnode) {
  const isReserved = !!xnode.reserved_until
  const timeLeft = isReserved
    ? Math.round((xnode.reserved_until - Date.now() / 1000) / 60)
    : 0
  const isExpired = timeLeft < 0

  let { xnode: reservedXnode } = useDemoContext()
  if (reservedXnode?.reservation?.reserved_until < Date.now() / 1000) {
    reservedXnode = undefined
  }

  const { data: cpu } = useDemoCPUUsage({
    xnode_id: xnode.id,
    secret: '',
  })
  const { data: memory } = useDemoMemoryUsage({
    xnode_id: xnode.id,
    secret: '',
  })
  const { data: disk } = useDemoDiskUsage({
    xnode_id: xnode.id,
    secret: '',
  })

  console.log(cpu)

  const cpuUsed = cpu?.reduce((prev, cur) => prev + cur.used / cpu.length, 0)

  const memoryUsed = memory?.used
  const memoryTotal = memory?.total

  const diskUnique = disk?.filter(
    (d1, i) => disk.findIndex((d2) => d1.name === d2.name) === i
  )
  const diskUsed = diskUnique?.reduce((prev, cur) => prev + cur.used, 0)
  const diskTotal = diskUnique?.reduce((prev, cur) => prev + cur.total, 0)

  return (
    <TableRow>
      <TableCell className="font-medium">
        {xnode.id.replace('https://', '').split('-').at(0)}
      </TableCell>
      <TableCell>
        {reservedXnode && reservedXnode.id === xnode.id ? (
          <Link
            className="text-blue-500"
            href={xnode.id.replace(':34392', '')}
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
      {/* <TableCell>
        <div className="flex w-full items-center gap-2">
          <Cpu className="size-4 text-muted-foreground" />
          <div className="relative h-2 w-24 rounded bg-border">
            <div
              className="absolute left-0 top-0 h-2 rounded bg-primary transition-all"
              style={{
                width: `${Math.min(Math.round(cpuUsed ?? 0), 100)}%`,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.round(cpuUsed ?? 0)}%
          </span>
        </div>
      </TableCell> */}
      <TableCell>
        <div className="flex w-full items-center gap-2">
          <MemoryStick className="size-4 text-muted-foreground" />
          <div className="relative h-2 w-24 rounded bg-border">
            <div
              className="absolute left-0 top-0 h-2 rounded bg-primary transition-all"
              style={{
                width: `${Math.min(((memoryUsed ?? 0) / (memoryTotal ?? 1)) * 100, 100)}%`,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {((memoryUsed ?? 0) / (1024 * 1024 * 1024)).toFixed(2)}
            GB/
            {((memoryTotal ?? 0) / (1024 * 1024 * 1024)).toFixed(0)}
            GB
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
                width: `${Math.min(((diskUsed ?? 0) / (diskTotal ?? 1)) * 100, 100)}%`,
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.round((diskUsed ?? 0) / (1024 * 1024 * 1024))}
            GB/
            {Math.round((diskTotal ?? 0) / (1024 * 1024 * 1024))}
            GB
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
        <Button
          variant="outline"
          size="sm"
          disabled={isReserved && !isExpired}
          onClick={() => (window.location.href = '/deploy/one-click')}
        >
          {isReserved && !isExpired ? 'Reserved' : 'Deploy AI App'}
        </Button>
      </TableCell>
    </TableRow>
  )
}
