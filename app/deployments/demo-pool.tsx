'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDemoDeploymentContext } from '@/contexts/DemoDeploymentContext'
import { useDemoContext } from '@/contexts/XnodeDemoContext'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  Check,
  Clock,
  Copy,
  Cpu,
  Eye,
  EyeOff,
  HardDrive,
  Key,
  Loader2,
  MemoryStick,
} from 'lucide-react'

import { generateDemoCredentials } from '@/lib/demo-credentials'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import Loading from '@/components/Loading'

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
          <TableHead>Credentials</TableHead>
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
  const [showPassword, setShowPassword] = useState(false)
  const isReserved = !!xnode.reserved_until
  const timeLeft = isReserved
    ? Math.round((xnode.reserved_until - Date.now() / 1000) / 60)
    : 0
  const isExpired = timeLeft < 0

  let { xnode: reservedXnode } = useDemoContext()
  if (reservedXnode?.reservation?.reserved_until < Date.now() / 1000) {
    reservedXnode = undefined
  }

  const { data: memory } = useDemoMemoryUsage({
    xnode_id: xnode.id,
    secret: '',
  })
  const { data: disk } = useDemoDiskUsage({
    xnode_id: xnode.id,
    secret: '',
  })

  const memoryUsed = memory?.used
  const memoryTotal = memory?.total

  const diskUnique = disk?.filter(
    (d1, i) => disk.findIndex((d2) => d1.name === d2.name) === i
  )
  const diskUsed = diskUnique?.reduce((prev, cur) => prev + cur.used, 0)
  const diskTotal = diskUnique?.reduce((prev, cur) => prev + cur.total, 0)

  const { deployed } = useDemoDeploymentContext()
  const { data: ready } = useQuery({
    initialData: false,
    queryKey: ['demoXnodeReady', xnode.id, reservedXnode?.id ?? ''],
    refetchInterval: 10_000, // 10 sec
    queryFn: async () => {
      try {
        return await fetch(xnode.id.replace(':34392', '')).then((res) => res.ok)
      } catch (e) {
        return false
      }
    },
    enabled: !!reservedXnode && xnode.id === reservedXnode.id,
  })

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
        {reservedXnode && reservedXnode.id === xnode.id && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                Username:
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono"
                onClick={() => {
                  const creds = generateDemoCredentials(xnode.id)
                  navigator.clipboard.writeText(creds.email)
                  toast({
                    title: 'Username copied',
                    description: 'Username has been copied to clipboard',
                  })
                }}
              >
                {generateDemoCredentials(xnode.id).email}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                Password:
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono"
                onClick={() => {
                  const creds = generateDemoCredentials(xnode.id)
                  navigator.clipboard.writeText(creds.password)
                  toast({
                    title: 'Password copied',
                    description: 'Password has been copied to clipboard',
                  })
                }}
              >
                {showPassword
                  ? generateDemoCredentials(xnode.id).password
                  : '••••••••'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </TableCell>
      <TableCell>
        {reservedXnode && reservedXnode.id === xnode.id ? (
          !deployed ? (
            <Button className="flex gap-2" variant="outline" size="sm" disabled>
              <div className="flex size-full place-items-center justify-center">
                <div className="size-4 animate-spin rounded-full border-b-2 border-[#0354EC]"></div>
              </div>
              <span>Deploying...</span>
            </Button>
          ) : !ready ? (
            <Button className="flex gap-2" variant="outline" size="sm" disabled>
              <div className="flex size-full place-items-center justify-center">
                <div className="size-4 animate-spin rounded-full border-b-2 border-orange-400"></div>
              </div>
              <span>Preparing...</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={xnode.id.replace(':34392', '')} target="_blank">
                Launch
              </Link>
            </Button>
          )
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={isReserved && !isExpired}
            asChild
          >
            <Link href="/app-store" target="_blank">
              {isReserved && !isExpired ? 'Reserved' : 'Deploy AI App'}
            </Link>
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
