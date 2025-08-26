'use client'

import { useEffect, useRef, useState } from 'react'
import { OpenxAICreditDepositContract } from '@/contracts/OpenxAICreditDeposit'
import { chain } from '@/utils/chain'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { erc20Abi } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

import { usePerformTransaction } from '@/hooks/usePerformTransaction'
import { useToast } from '@/components/ui/use-toast'

export default function PlanDetails({ tokenId }: { tokenId: bigint }) {
  const { address } = useAccount()
  const { toast } = useToast()

  const [isExpanded, setIsExpanded] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [renewalMonths, setRenewalMonths] = useState('')

  const { data: pricePerMonth } = useQuery({
    queryKey: ['ownaiv1_price'],
    queryFn: async () => {
      return await axios
        .get('https://indexer.core.openxai.org/api/ownaiv1/base/price')
        .then((res) => res.data as number)
    },
  })
  const months = parseInt(renewalMonths) || 0

  const calculatedRenewalCost =
    pricePerMonth !== undefined && months > 0 ? months * pricePerMonth : 0

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isExpanded])

  const { data: server, refetch: refetchServer } = useQuery({
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

  const { data: total_credits, refetch: refetchCredits } = useQuery({
    queryKey: ['total_credits', address ?? ''],
    enabled: !!address,
    queryFn: async () => {
      return await axios
        .get(`https://indexer.core.openxai.org/api/${address}/total_credits`)
        .then((res) => res.data as number)
    },
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!server) {
        return
      }

      const now = new Date()
      const difference = server.expires * 1000 - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        )
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeRemaining({ days, hours, minutes, seconds })
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(timer)
  }, [server])

  const daysUntilExpiration = timeRemaining.days

  const { performTransaction, performingTransaction, loggers } =
    usePerformTransaction({ chainId: chain.id })
  const { signMessageAsync } = useSignMessage()

  return (
    <div className="rounded-lg border border-[#EBEBEB] shadow-sm">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-sm font-semibold text-[#000000] md:text-xl">
          Plan Details
        </h2>
        {isExpanded ? (
          <ChevronUp className="size-5 text-[#959595]" />
        ) : (
          <ChevronDown className="size-5 text-[#959595]" />
        )}
      </div>

      <div
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0px',
        }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <div ref={contentRef} className="px-4 pb-4">
          {daysUntilExpiration < 10 && (
            <div className="mb-4 rounded-md border border-solid border-[#F6DFDF] bg-[#F6DFDF] px-4 py-3 text-[#C73A3A]">
              <p className="text-sm font-semibold">
                Your plan expires in {daysUntilExpiration} days. <br />
                <span className="font-normal">
                  Renew now to prevent permanent data loss!
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <h3 className="rounded-[12px] border border-[#F0F0F0] bg-[#F5F5F5] py-4 pl-4 text-[14px] font-medium text-[#141414] md:text-[18px]">
                Current Plan
              </h3>
              <div className="space-y-6 px-4">
                <div className="flex justify-between">
                  <span className="text-[12px] font-[400] text-[#525252] md:text-sm">
                    Type:
                  </span>
                  <span className="text-[12px] font-medium text-[#3D3D3D] md:text-sm">
                    OwnAIv1
                  </span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-[12px] font-[400] text-[#525252] md:text-sm">
                    Chain:
                  </span>
                  <span className="text-[12px] font-medium text-[#3D3D3D] md:text-sm">
                    Base
                  </span>
                </div>
                <hr />
                {tokenId !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">
                      Token ID:
                    </span>
                    <span className="text-[12px] font-medium text-[#3D3D3D] md:text-sm">
                      {tokenId.toString()}
                    </span>
                  </div>
                )}
                <hr />
                {server && (
                  <div className="flex justify-between">
                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">
                      Expiring Date:
                    </span>
                    <span className="text-[12px] font-medium text-[#3D3D3D] md:text-sm">
                      {new Date(server.expires * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between">
                  <span className="text-[12px] font-[400] text-[#525252] md:text-sm">
                    Price:
                  </span>
                  <span className="flex items-center text-[12px] font-medium md:text-sm">
                    {(pricePerMonth / 1_000_000).toFixed(0)} GPU Credits / month
                  </span>
                </div>
              </div>

              <div
                className={`rounded-md border px-4 py-3 ${
                  timeRemaining.days > 30
                    ? 'border-[#DFF6DF] bg-[#DFF6DF] text-[#0F7B0F]'
                    : 'border-[#F6DFDF] bg-[#F6DFDF] text-[#C73A3A]'
                }`}
              >
                <div className="flex justify-between text-[12px] font-semibold md:text-sm">
                  <span>Time Remaining</span>
                  <span>
                    {timeRemaining.days} days, {timeRemaining.hours} hours,{' '}
                    {timeRemaining.minutes} minutes, {timeRemaining.seconds}{' '}
                    seconds
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-7">
              <h3 className="rounded-[12px] border border-[#F0F0F0] bg-[#F5F5F5] py-4 pl-4 text-[14px] font-medium text-[#141414] md:text-[18px]">
                Manage your Plan
              </h3>

              <div className="flex flex-col gap-8 px-4">
                <div className="flex w-full items-center justify-between">
                  <label className="text-[12px] font-medium text-[#525252] md:text-sm">
                    Renewal Time Period (Months)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter in Months"
                    value={renewalMonths}
                    onChange={(e) => {
                      const value = e.target.value

                      if (value.length <= 2) {
                        setRenewalMonths(value)
                      }
                    }}
                    className="w-[50%] rounded-md border border-gray-300 px-3 py-1"
                    min={1}
                    max={99}
                  />
                </div>

                <hr />

                <div className="flex justify-between">
                  <span className="text-[12px] font-[400] text-[#525252] md:text-sm">
                    Renewal Cost:
                  </span>
                  <span className="flex items-center text-[12px] font-medium md:text-sm">
                    {(calculatedRenewalCost / 1_000_000).toFixed(2)}{' '}
                    <span className="ml-1 text-[12px] font-semibold text-[#525252] md:text-sm">
                      GPU Credits
                    </span>
                  </span>
                </div>

                <hr className="h-0 text-[#CCCCCC]" />

                <div className="flex justify-between">
                  <span className="text-[12px] font-[400] text-[#525252] md:text-sm">
                    Total Cost:
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center font-medium">
                      <span className="text-[12px] font-bold text-[#0040B8] md:text-[16px]">
                        {(calculatedRenewalCost / 1_000_000).toFixed(2)}
                        <span className="font-semibold"> GPU Credits</span>
                      </span>
                    </span>
                    {renewalMonths && parseInt(renewalMonths) > 0 && (
                      <span className="self-end text-[13px] text-[#525252]">
                        {(pricePerMonth / 1_000_000).toFixed(0)}/month
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const months = parseInt(renewalMonths)
                    if (!(months > 0)) {
                      loggers?.onError?.({
                        title: 'Invalid renewal months',
                        description: `${renewalMonths} is invalid.`,
                      })
                      return
                    }

                    if (total_credits === undefined) {
                      loggers?.onError?.({
                        title: 'Credits fetching failed',
                        description: `Could not determine account GPU credits.`,
                      })
                      return
                    }

                    if (tokenId === undefined) {
                      loggers?.onError?.({
                        title: 'TokenId parsing failed',
                        description: `Could not determine NFT tokenId.`,
                      })
                      return
                    }

                    const credits_cost = calculatedRenewalCost
                    if (credits_cost > total_credits) {
                      performTransaction({
                        transactionName: 'Buy Credits',
                        transaction: async () => {
                          return {
                            abi: erc20Abi,
                            address:
                              chain.id === 84532
                                ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
                                : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                            functionName: 'transfer',
                            args: [
                              OpenxAICreditDepositContract.address,
                              BigInt(credits_cost - total_credits),
                            ],
                          }
                        },
                        onConfirmed: () => {
                          new Promise((resolve) =>
                            setTimeout(resolve, 3_000)
                          ).then(() => {
                            refetchCredits()
                          })
                        },
                      })
                    } else {
                      toast({
                        title: 'Please confirm in your wallet',
                        description:
                          'Signing the message is used as confirmation to spend your credits.',
                      })

                      signMessageAsync({
                        account: address,
                        message: `Extend expiry of ownaiv1@base@${tokenId.toString()} by ${months} months`,
                      })
                        .then((signature) => {
                          return axios.post(
                            `https://indexer.core.openxai.org/api/ownaiv1/base/${tokenId.toString()}/expires`,
                            {
                              months,
                              payer_address: address,
                              payer_signature: signature,
                            }
                          )
                        })
                        .then(() => {
                          refetchCredits()
                          refetchServer()
                          setRenewalMonths('')
                        })
                        .catch(console.error)
                    }
                  }}
                  className={`w-full rounded-md px-4 py-2 font-medium transition-colors ${
                    parseInt(renewalMonths) > 0
                      ? 'cursor-pointer bg-blue500 text-white hover:bg-blue-400'
                      : 'cursor-not-allowed bg-[#99BDFF] text-white'
                  }`}
                  disabled={
                    performingTransaction ||
                    !renewalMonths ||
                    parseInt(renewalMonths) <= 0
                  }
                >
                  {total_credits !== undefined &&
                  calculatedRenewalCost > total_credits
                    ? 'Buy Credits'
                    : 'Renew'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
