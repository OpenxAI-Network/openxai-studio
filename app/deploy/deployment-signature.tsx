'use client'

import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react'
import type { SignMessageReturnType } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

export function DeploymentSignature({
  app,
  version,
  open,
  close,
}: {
  app?: string
  version?: string
  open: boolean
  close: (signature?: SignMessageReturnType) => void
}) {
  const { address } = useAccount()
  const { open: connectWallet } = useWeb3Modal()
  const { open: connectWalletOpen } = useWeb3ModalState()

  const { toast } = useToast()
  const { signMessageAsync } = useSignMessage()
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (connectWalletOpen) {
          return
        }

        if (!open) {
          close()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Deployment</DialogTitle>
        </DialogHeader>
        <span>
          Connect your wallet and sign a (gas-free) message to share your
          deployment publicly. Wallets that participate in this program might be
          eligible for an airdrop or other benefits in the future.
        </span>
        <DialogFooter>
          {address ? (
            <div className="flex w-full flex-col gap-1">
              <Button
                className="w-full"
                onClick={() => {
                  toast({
                    title: 'Please check your wallet',
                    description: 'Deployment signature request sent.',
                  })

                  signMessageAsync({
                    account: address,
                    message: `I just deployed ${version} of xnode-ai-chat:${app} on OpenxAI Studio!`,
                  }).then((signature) => close(signature))
                }}
              >
                Share Deployment
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  close('0x')
                }}
              >
                Skip
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                connectWallet()
              }}
            >
              Connect Wallet
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
