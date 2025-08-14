'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useAccount } from 'wagmi'

import { toXnodeAddress } from '@/lib/xnode'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function MyXnodes() {
  const { address } = useAccount()

  const { data: servers } = useQuery({
    queryKey: ['controller_servers', address ?? ''],
    enabled: !!address,
    queryFn: async () => {
      return await axios
        .get(
          `https://indexer.core.openxai.org/api/ownaiv1/${toXnodeAddress({ address })}/controller_servers`
        )
        .then((res) => res.data as { chain: string; token_id: string }[])
    },
  })

  if (!servers?.length) {
    return <></>
  }

  return (
    <div className="@container flex flex-col gap-3">
      <span className="text-3xl font-bold">Your Servers</span>
      <div className="@max-lg:grid-cols-1 @max-3xl:grid-cols-2 @max-6xl:grid-cols-3 grid grid-cols-4 gap-3">
        {servers?.map((xnode, i) => (
          <Link
            key={i}
            href={`/xnode?baseUrl=https://manager.${xnode.token_id}.${xnode.chain}.ownaiv1.openxai.network`}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {xnode.chain}#{xnode.token_id}
                </CardTitle>
                <CardDescription>ERC721 Tokenized Server</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex place-content-center">
                  <Image
                    alt={'OwnAIv1 NFT image'}
                    src={`https://erc721.openxai.org/image/OwnAIv1/default.png`}
                    width={100}
                    height={100}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
