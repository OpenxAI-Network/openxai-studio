import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { OpenxAICreditDepositContract } from '@/contracts/OpenxAICreditDeposit'
import { chain } from '@/utils/chain'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  HelpCircle,
  Hourglass,
  Info,
  Wallet,
} from 'lucide-react'
import { erc20Abi } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { usePerformTransaction } from '@/hooks/usePerformTransaction'

import { Alert, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Separator } from './ui/separator'

export function CreditsPayment({
  item,
  price,
  close,
}: {
  item: string
  price: number
  close: (success: boolean) => void
}) {
  const { address } = useAccount()
  const { data: total_credits, refetch: refetchCredits } = useQuery({
    queryKey: ['total_credits', address ?? ''],
    enabled: !!address,
    queryFn: async () => {
      if (!address) {
        return undefined
      }

      return axios
        .get(`https://indexer.core.openxai.org/api/${address}/total_credits`)
        .then((res) => res.data as number)
    },
  })

  const [topUp, setTopUp] = useState<number>(0)
  useEffect(() => {
    if (total_credits === undefined) {
      return
    }

    setTopUp(Math.round((price - total_credits) / 1_000_000))
  }, [total_credits, price])

  const { performTransaction, performingTransaction } = usePerformTransaction({
    chainId: chain.id,
  })
  const [step, setStep] = useState<'buy' | 'wait' | 'confirm'>('buy')

  const tokenAddress = useMemo(() => {
    return chain.id === 84532
      ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
      : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  }, [chain])

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    },
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          close(false)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex flex-col gap-3">
          <div className="flex place-content-between place-items-center">
            <span>Cost of {item}</span>
            <div className="flex place-items-center gap-1 rounded-lg bg-green-200 px-2 py-1 text-sm">
              <CircleDollarSign className="size-5" />
              <span>
                {price / 1_000_000} GPU Credits ({price / 1_000_000} USDC)
              </span>
            </div>
          </div>
          {step === 'confirm' ? (
            <div className="flex gap-1 text-green-600">
              <CheckCircle2 />
              <span>Payment confirmed and credits updated</span>
            </div>
          ) : step === 'wait' ? (
            <div className="flex gap-1 text-orange-500">
              <Hourglass />
              <span>Waiting for transaction confirmation</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {total_credits !== undefined && (
                <div className="flex place-content-between place-items-center">
                  <span>Your wallet balance</span>
                  <div className="flex place-items-center gap-1 rounded-lg bg-blue-200 px-2 py-1 text-sm">
                    <Wallet className="size-5" />
                    <span>
                      {(total_credits / 1_000_000).toFixed(2)} GPU Credits
                    </span>
                  </div>
                </div>
              )}
              <div className="flex place-content-between place-items-center">
                <span>You need</span>
                <div className="flex place-items-center gap-1 rounded-lg bg-red-200 px-2 py-1 text-sm">
                  <span>{topUp} GPU Credits</span>
                </div>
              </div>
              <div className="flex place-content-between place-items-center">
                <span>You will be charged</span>
                <span>{topUp} USDC</span>
              </div>
              {item !== undefined &&
                item === "OpenxAI's Dedicated Tokenized GPU" && (
                  <Alert>
                    <div className="flex place-items-center gap-1">
                      <AlertTitle>
                        You can stake your GPU to earn rewards - 330% APY
                      </AlertTitle>
                      <Link href="/" target="_blank">
                        <HelpCircle className="size-5" />
                      </Link>
                    </div>
                  </Alert>
                )}
              {balance !== undefined &&
                balance < BigInt(topUp) * BigInt(1_000_000) && (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>
                      Insufficient USDC balance for account {address}
                    </AlertTitle>
                  </Alert>
                )}
            </div>
          )}
        </div>
        {step === 'buy' && (
          <DialogFooter className="grid grid-cols-2">
            <Button
              className="rounded-lg border-primary text-primary"
              variant="outline"
              onClick={() => {
                close(false)
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-lg"
              onClick={() => {
                performTransaction({
                  transactionName: 'Buy Credits',
                  transaction: async () => {
                    return {
                      abi: erc20Abi,
                      address: tokenAddress,
                      functionName: 'transfer',
                      args: [
                        OpenxAICreditDepositContract.address,
                        BigInt(topUp) * BigInt(1_000_000),
                      ],
                    }
                  },
                  onSubmitted() {
                    setStep('wait')
                  },
                  onConfirmed: () => {
                    setStep('confirm')
                    new Promise((resolve) => setTimeout(resolve, 3_000)).then(
                      () => {
                        refetchCredits()
                        setStep('buy')
                        close(true)
                      }
                    )
                  },
                })
              }}
              disabled={
                performingTransaction ||
                (balance !== undefined &&
                  balance < BigInt(topUp) * BigInt(1_000_000))
              }
            >
              Purchase Credits
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
