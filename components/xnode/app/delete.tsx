'use client'

import { xnode } from '@openmesh-network/xnode-manager-sdk'
import { useConfigContainerRemove } from '@openmesh-network/xnode-manager-sdk-react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { useRequestPopup } from '../request-popup'

export interface AppDeleteParams {
  session?: xnode.utils.Session
  container: string
}

export function AppDelete(params: AppDeleteParams) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 className="text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <AppDeleteInner {...params} />
      </DialogContent>
    </Dialog>
  )
}

function AppDeleteInner({ session, container }: AppDeleteParams) {
  const setRequestPopup = useRequestPopup()
  const { mutate: remove } = useConfigContainerRemove({
    overrides: {
      onSuccess({ request_id }) {
        setRequestPopup({ request_id })
      },
    },
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete {container}</DialogTitle>
        <DialogDescription>
          This will permanently remove this app and all it&apos;s data. This
          action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        {session && (
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => {
                remove({
                  session,
                  path: { container },
                })
              }}
            >
              Delete
            </Button>
          </DialogClose>
        )}
      </DialogFooter>
    </>
  )
}
