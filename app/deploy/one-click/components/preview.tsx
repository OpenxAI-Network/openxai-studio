'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface TokenizationProps {
  start: Partial<{
    Token: string
    Legal: string
    isAgree: boolean
    AI_Data: string
    Token_label: string
    Address: string
    Amount: string
    label: string
  }>
  setFinalAmount: React.Dispatch<React.SetStateAction<boolean>>
  setExpandedItem: (value: string | null) => void
}

export default function Tokenization({
  start,
  setFinalAmount,
  setExpandedItem,
}: TokenizationProps) {
  const [selected, onSelect] = useState<
    Partial<{
      Token: string
      Legal: string
      isAgree: boolean
      AI_Data: string
      Token_label: string
      Address: string
      Amount: string
      label: string
    }>
  >(start)
  const { address, isConnected, status } = useAccount()
  const [price, setPrice] = useState('Price')
  const Legal_Structure = [
    {
      option: 'Use smart contracts',
    },
    {
      option: 'Use more smart contracts',
    },
  ]
  const AI_Data = [
    {
      option: "It's 100% yours. No middleman",
    },
    {
      option: "Unfortunately, we can't change it :)",
    },
  ]
  const [tokenizationOption, setTokenizationOption] = useState({
    Token: 'sellEntireMonetization',
    Legal: Legal_Structure[0]?.option,
    isAgree: false,
    AI_Data: AI_Data[0]?.option,
    Token_label: 'ERC-721 (NFT)',
    Address: address,
    Amount: '150.00 USDT',
    label: 'Sell entire service to someone',
    ...start,
  })
  const [iAgree, setIAgree] = useState(false)

  useEffect(() => {
    if (selected) {
      if (selected.Token === 'ERC-721 (NFT)') {
        setTokenizationOption((prev) => ({
          ...prev,
          Token: 'sellEntireMonetization',
          label: 'Sell entire service to someone',
          Token_label: selected.Token,
        }))
      } else if (selected.Token === 'On-chain SaaS') {
        setTokenizationOption((prev) => ({
          ...prev,
          Token: 'buildChainOnSaaS',
          label: 'Sell entire service to On-chain SaaS',
          Token_label: selected.Token,
        }))
      }
    }
  }, [selected])

  useEffect(() => {
    onSelect(tokenizationOption)
  }, [tokenizationOption])

  const handleTokenizationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    console.log('Value ==>', value)
    setTokenizationOption((prev) => ({
      ...prev,
      Token: value,
    }))
  }

  const handleSelectLegal = (option: string) => {
    setTokenizationOption((prev) => ({
      ...prev,
      Legal: option,
    }))
  }

  const handleSelectData = (option: string) => {
    setTokenizationOption((prev) => ({
      ...prev,
      AI_Data: option,
    }))
  }

  const handleOptionSelect = () => {
    onSelect(tokenizationOption)
    setFinalAmount(true)
  }
  const handleIAgreeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIAgree(event.target.checked)
  }

  const { open } = useWeb3Modal()
  const pressWalletButton = () => {
    open()
  }

  const CHAIN_OPTIONS = [
    {
      image: '/images/viewDeployment/ollama.svg',
      value: 'Base',
    },
    {
      image: '/images/subNavBarData/ethereum.svg',
      value: 'Ethereum',
    },
    {
      image: '/images/subNavBarData/bitcoin.svg',
      value: 'Bitcoin',
    },
  ]

  const Price_OPTIONS = [
    {
      image: '/images/openxai-logo.png',
      value: 'OPENX',
    },
  ]

  const [selectedChain, setSelectedChain] = useState(CHAIN_OPTIONS[0])

  return (
    <div className="font-inter">
      <div className="mx-auto">
        <div className="relative mb-8 flex gap-8 py-2">
          <div className="space-y-2">
            <Select
              value={JSON.stringify(selectedChain)}
              onValueChange={(val) => {
                setSelectedChain(JSON.parse(val))
              }}
            >
              <SelectTrigger className="w-72 rounded-lg py-2 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent>
                {CHAIN_OPTIONS.map((chain, index) => (
                  <SelectItem
                    key={index}
                    value={JSON.stringify(chain)}
                    className="my-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Image src={chain.image} alt="" width={20} height={20} />
                      <div>{chain.value}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="">
            {isConnected ? (
              <button
                type="button"
                className="flex h-10 w-full items-center rounded-md bg-primary px-8 text-sm text-background"
              >
                {address && status === 'connected' && (
                  <span className="w-full">{formatAddress(address)}</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="flex h-10 items-center gap-1.5 rounded-md bg-primary px-8 text-base font-semibold tracking-tighter text-background max-hdplus:text-sm"
                onClick={pressWalletButton}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-[#000000]">
            Tokenization
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex cursor-pointer items-start rounded-md p-4">
              <input
                type="radio"
                name="tokenization"
                value="sellEntireMonetization"
                checked={tokenizationOption.Token === 'sellEntireMonetization'}
                onChange={(e) => {
                  handleTokenizationChange(e)
                }}
                className="form-radio mt-0.5 size-4 accent-blue-600"
              />
              <div className="ml-3">
                <span className="block font-medium text-[#000000]">
                  Sell entire app service to someone{' '}
                  <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#757575] text-xs font-semibold text-white">
                    ?
                  </span>
                </span>
                <p className="mt-1 text-sm text-[#8E8E8E]">
                  You can sell, data, infra & to someone in one go using ERC-721
                  standards
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start rounded-md p-4">
              <input
                type="radio"
                name="tokenization"
                value="buildChainOnSaaS"
                checked={tokenizationOption.Token === 'buildChainOnSaaS'}
                onChange={(e) => {
                  handleTokenizationChange(e)
                }}
                className="form-radio mt-0.5 size-4 text-blue-600"
              />
              <div className="ml-3">
                <span className="block font-medium text-[#000000]">
                  Build on-chain SaaS
                </span>
                <p className="mt-1 text-sm text-[#8E8E8E]">
                  Instead of using a bank accounts, credit cards, use smart
                  contracts. ERC-4337 - Service Subscription Earn ongoing
                  royalties (licensed, rented, or resold)
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="mb-14">
          <h2 className="mb-4 text-xl font-medium text-[#000000]">
            Monetization
          </h2>

          {tokenizationOption.Token === 'sellEntireMonetization' ? (
            <div className="grid grid-cols-2 items-center">
              <div className="flex flex-col">
                <label
                  htmlFor="token-type"
                  className="block text-sm font-medium text-[#000000]"
                >
                  Enter the token type & amount you want to sell to
                </label>
                <p className="text-sm text-[#8E8E8E]">
                  How would you charge from your users
                </p>
              </div>
              <div className="flex items-center justify-start gap-3 px-3 py-2">
                <input
                  type="number"
                  id="token-amount"
                  className="h-10 w-20 rounded-md border border-gray-300 px-3 text-sm text-[#000000] outline-none"
                  placeholder="0.00"
                />
                <Select defaultValue={JSON.stringify(Price_OPTIONS[0])}>
                  <SelectTrigger className="w-72 rounded-lg py-2 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select Chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {Price_OPTIONS.map((chain, index) => (
                      <SelectItem
                        key={index}
                        value={JSON.stringify(chain)}
                        className="my-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={chain.image}
                            alt=""
                            width={20}
                            height={20}
                          />
                          <div>{chain.value}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 grid grid-cols-2">
                <div>
                  <label
                    htmlFor="revenue-model"
                    className="block text-sm font-medium text-[#000000]"
                  >
                    Your revenue model
                  </label>
                  <p className="mb-2 text-sm text-[#8E8E8E]">
                    How would you charge from your users
                  </p>
                </div>
                <div className="flex gap-2 rounded-md px-6 py-1">
                  <button
                    onClick={() => setPrice('Free')}
                    className={`w-20 rounded-md ${price === 'Free' ? 'bg-blue-600 text-white' : 'border text-gray-700 hover:bg-gray-300'} p-2`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setPrice('Price')}
                    className={`w-20 rounded-md ${price === 'Price' ? 'bg-blue-600 text-white' : 'border text-gray-700 hover:bg-gray-300'} p-2 shadow-sm`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              {price === 'Price' && (
                <div className="mb-4 grid items-center justify-between gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="price-access"
                      className="block text-sm font-medium text-[#000000]"
                    >
                      Price per access
                    </label>
                    <p className="mb-2 text-sm text-[#8E8E8E]">
                      How would you charge from your users (1k Tokens)
                    </p>
                  </div>
                  <div className="flex items-center justify-start gap-3 px-3 py-2">
                    <input
                      type="number"
                      id="token-amount"
                      className="h-10 w-20 rounded-md border border-gray-300 px-3 text-sm text-[#000000] outline-none"
                      placeholder="0.00"
                    />
                    <Select defaultValue={JSON.stringify(Price_OPTIONS[0])}>
                      <SelectTrigger className="w-72 rounded-lg py-2 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select Chain" />
                      </SelectTrigger>
                      <SelectContent>
                        {Price_OPTIONS.map((chain, index) => (
                          <SelectItem
                            key={index}
                            value={JSON.stringify(chain)}
                            className="my-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={chain.image}
                                alt=""
                                width={20}
                                height={20}
                              />
                              <div>{chain.value}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {price === 'Price' && (
                <div className="grid items-center gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fund-wallet"
                      className="block text-sm font-medium text-[#000000]"
                    >
                      Fund receiving wallet (Bank account)
                    </label>
                    <p className="mb-2 text-sm text-[#8E8E8E]">
                      This acts like your bank account
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 px-3">
                    <input
                      type="text"
                      id="fund-wallet-address"
                      className="grow rounded-md border border-gray-300 p-2 text-blue-500 focus:border-blue-500 focus:ring-blue-500"
                      value={tokenizationOption.Address}
                      onChange={(e) =>
                        setTokenizationOption({
                          ...tokenizationOption,
                          Address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-16">
          <h2 className="mb-8 text-xl font-semibold text-[#000000]">
            Privacy, Owner & IP
          </h2>
          <div className="mb-10 grid items-center gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="ai-data-ip"
                className="block text-sm font-medium text-[#000000]"
              >
                Your AI, Data & All Intellectual Property
              </label>
              <p className="text-sm text-[#8E8E8E]">
                Other providers keep data & own infra
              </p>
            </div>
            <Select
              value={selected?.AI_Data}
              onValueChange={(val) => {
                handleSelectData(val)
              }}
            >
              <SelectTrigger className="w-92 rounded-lg py-2 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent>
                {AI_Data.map((chain, index) => (
                  <SelectItem
                    key={index}
                    value={chain.option}
                    className="my-2 cursor-pointer hover:bg-gray-100"
                  >
                    <div>{chain.option}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="company-structure"
                className="block text-sm font-medium text-[#000000]"
              >
                Company, Entity & Legal Structure
              </label>
              <p className="text-sm text-[#8E8E8E]">
                Use smart contracts instead of lawyers and entity
              </p>
            </div>
            <Select
              value={selected?.Legal}
              onValueChange={(val) => {
                handleSelectLegal(val)
              }}
            >
              <SelectTrigger className="w-92 rounded-lg py-2 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent>
                {Legal_Structure.map((chain, index) => (
                  <SelectItem
                    key={index}
                    value={chain.option}
                    className="my-2 cursor-pointer hover:bg-gray-100"
                  >
                    <div>{chain.option}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-8">
          <p className="mb-4 text-[#000000]">
            You will receive your funds to{' '}
            <span className="font-medium underline">
              {formatAddress(tokenizationOption.Address)}
            </span>
            .
          </p>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={iAgree}
              onChange={handleIAgreeChange}
              className="form-checkbox size-5 rounded text-blue-600"
            />
            <span className="ml-2 text-[#000000]">I agree</span>
          </label>
        </div>

        <div className="mb-16 text-[#000000]">
          <p className="mb-2 flex items-center">
            Estimate gas fees <span className="mx-2 font-bold">$0.005</span>
            <img src="/images/viewDeployment/ollama.svg" alt="" />
          </p>
          <p>
            Estimate time for execution <span className="font-bold">~20s</span>
          </p>
        </div>

        <div className="text-left">
          <button
            className="rounded-md bg-blue-600 px-10 py-3 font-semibold text-white shadow-md hover:bg-blue-700"
            onClick={() => {
              if (iAgree) {
                setExpandedItem(null)
                handleOptionSelect()
              } else {
                alert('Please agree to continue.')
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
