'use client'

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

export function LatestDeployments({ app }: { app?: string }) {
  const { data: app_latest } = useQuery({
    queryKey: ['app_latest', app ?? ''],
    enabled: !!app,
    queryFn: async () => {
      return axios
        .get(
          `https://indexer.core.openxai.org/api/deployment_signature/latest/xnode-ai-chat:${app}`
        )
        .then(
          (res) =>
            res.data as {
              xnode: string
              version: string
              deployer?: string
              signature?: string
              date: number
            }[]
        )
    },
  })

  return (
    <div className="flex flex-col gap-1 text-base text-black">
      <span>Latest deployments</span>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Demo</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Deployer</TableHead>
            <TableHead>Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {app_latest?.map((deployment, i) => (
            <TableRow key={i}>
              <TableCell>
                {deployment.xnode.includes('demo.openxai.org') ? (
                  <Check />
                ) : (
                  <Cross />
                )}
              </TableCell>
              <TableCell>{deployment.version}</TableCell>
              <TableCell>
                {new Date(deployment.date * 1000).toLocaleDateString()}{' '}
                {new Date(deployment.date * 1000).toLocaleTimeString()}
              </TableCell>
              <TableCell className="break-all">
                {deployment.deployer ?? '-'}
              </TableCell>
              <TableCell className="break-all">
                {deployment.signature ?? '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
