import React, { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface RewardsProps {
  tokenId?: bigint
}

interface Reward {
  account: string
  amount: number
  date: number
}

const Rewards = ({ tokenId }: RewardsProps) => {
  const { data: staking } = useQuery({
    queryKey: ['staking', tokenId?.toString() ?? ''],
    queryFn: async () => {
      return await axios
        .get(
          `https://indexer.core.openxai.org/api/ownaiv1/base/${tokenId}/staking`
        )
        .then((res) => res.data as Reward[])
        .then((rewards) => rewards.sort((r1, r2) => r2.date - r1.date))
    },
  })

  const { data: server } = useQuery({
    queryKey: ['server', tokenId?.toString() ?? ''],
    enabled: tokenId !== undefined,
    queryFn: async () => {
      return await axios
        .get(
          `https://indexer.core.openxai.org/api/ownaiv1/base/${tokenId}/server`
        )
        .then((res) => res.data as { owner: string; expires: number })
    },
  })

  const estimated = useMemo(() => {
    if (!server) {
      return undefined
    }

    var midnight = new Date()
    midnight.setUTCHours(24, 0, 0, 0)
    const epoch = Math.round(midnight.getTime() / 1000)
    return Array.from({ length: 7 })
      .map((_, i) => {
        return {
          account: server.owner,
          amount: 0,
          date: epoch + i * 24 * 60 * 60,
        } satisfies Reward
      })
      .filter((reward) => reward.date < server.expires)
  }, [server])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 pt-8">
        <div className="text-sm font-bold text-[#141414] xl:text-base 2xl:text-xl 3xl:text-2xl">
          Rewards
        </div>
        <Link href="https://dashboard.openxai.org/claims" target="_blank">
          <button className="rounded-lg border-2 border-[#525252] px-8 py-2 font-medium text-[#525252]">
            Claim
          </button>
        </Link>
      </div>

      {estimated && (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">
            Estimated Upcoming (
            {(
              estimated.reduce((prev, cur) => prev + cur.amount, 0) / 1_000_000
            ).toFixed(2)}{' '}
            OPENX)
          </span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimated.map((reward, i) => (
                <Reward key={i} reward={reward} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {staking && (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">
            Past (
            {(
              staking
                .filter((reward) => reward.account === server.owner)
                .reduce((prev, cur) => prev + cur.amount, 0) / 1_000_000
            ).toFixed(2)}{' '}
            OPENX)
          </span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staking.slice(0, 7).map((reward, i) => (
                <Reward key={i} reward={reward} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function Reward({ reward }: { reward: Reward }) {
  return (
    <TableRow>
      <TableCell>{new Date(reward.date * 1000).toLocaleDateString()}</TableCell>
      <TableCell>{reward.account}</TableCell>
      <TableCell>{(reward.amount / 1_000_000).toFixed(2)} OPENX</TableCell>
    </TableRow>
  )
}

export default Rewards
