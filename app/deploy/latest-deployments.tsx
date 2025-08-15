'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Check, Cross } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Deployment {
  xnode: string
  version: string
  deployer?: string
  signature?: string
  date: number
}

export function LatestDeployments({ app }: { app?: string }) {
  const { data: app_latest } = useQuery({
    queryKey: ['app_latest', app ?? ''],
    enabled: !!app,
    queryFn: async () => {
      return axios
        .get(
          `https://indexer.core.openxai.org/api/deployment_signature/latest/xnode-ai-chat:${app}`
        )
        .then((res) => res.data as Deployment[])
    },
  })

  return (
    <div className="flex flex-col gap-1 text-base text-black">
      <span>Latest deployments</span>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time & Date</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Deployer</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {app_latest?.map((deployment, i) => (
            <Deployment key={i} deployment={deployment} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function Deployment({ deployment }: { deployment: Deployment }) {
  const age = useMemo(() => {
    const interval = Math.round(Date.now() / 1000) - deployment.date
    if (interval < 60) {
      return `${interval} seconds ago`
    }
    if (interval < 60 * 60) {
      return `${Math.round(interval / 60)} minutes ago`
    }
    if (interval < 24 * 60 * 60) {
      return `${Math.round(interval / (60 * 60))} hours ago`
    }

    return `${Math.round(interval / (24 * 60 * 60))} days ago`
  }, [Date.now()])

  return (
    <TableRow className="h-16">
      <TableCell>
        {new Date(deployment.date * 1000).toLocaleDateString()}{' '}
        {new Date(deployment.date * 1000).toLocaleTimeString()}
      </TableCell>
      <TableCell>{deployment.version}</TableCell>
      <TableCell>
        {deployment.deployer
          ? `${deployment.deployer.slice(0, 7)}...${deployment.deployer.slice(-4)}`
          : '-'}
      </TableCell>
      <TableCell>{age}</TableCell>
      <TableCell>
        <span className="whitespace-nowrap rounded-lg border bg-slate-50 px-2 py-1">
          {deployment.xnode.includes('demo.openxai.org')
            ? 'Deployment (D)'
            : 'Deployment (L)'}
        </span>
      </TableCell>
      <TableCell>
        {deployment.signature
          ? `${deployment.signature.slice(0, 7)}...${deployment.signature.slice(-4)}`
          : '-'}
      </TableCell>
    </TableRow>
  )
}
