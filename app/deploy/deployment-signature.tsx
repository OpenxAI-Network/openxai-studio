'use client'

import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react'
import { CheckSquare2 } from 'lucide-react'
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
          <DialogTitle>
            Would you like to authenticate your deployment record?
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex gap-1">
            <CheckSquare2 />
            <span>Record on-chain (gas-free)</span>
          </div>
          <div className="flex gap-1">
            <CheckSquare2 />
            <span>Share your launch record with the world</span>
          </div>
          <div className="flex gap-1">
            <CheckSquare2 />
            <span>
              Unlock eligibility for <strong>$OPENX rewards</strong>
            </span>
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full flex-col gap-1">
            {address ? (
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
                Sign and share (gas-free)
              </Button>
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
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                close('0x')
              }}
            >
              No, I will skip
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
