'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { xnode } from '@openmesh-network/xnode-manager-sdk'
import {
  useConfigContainerGet,
  useConfigContainerSet,
} from '@openmesh-network/xnode-manager-sdk-react'

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
import { Label } from '@/components/ui/label'
import { NixEditor } from '@/components/ui/nix-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useRequestPopup } from '../request-popup'

export interface AppEditParams {
  session?: xnode.utils.Session
  container: string
}

export function AppEdit(params: AppEditParams) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center justify-center rounded-md border border-[#525252] px-10 py-2 text-[10px] font-[500] text-[#525252] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px]">
          Edit
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-7xl">
        <AppEditInner {...params} />
      </DialogContent>
    </Dialog>
  )
}

function AppEditInner({ session, container }: AppEditParams) {
  const setRequestPopup = useRequestPopup()
  const { mutate: set } = useConfigContainerSet({
    overrides: {
      onSuccess({ request_id }) {
        setRequestPopup({ request_id })
      },
    },
  })

  const { data: config } = useConfigContainerGet({
    session,
    container,
  })

  const [networkEdit, setNetworkEdit] = useState<string>('')
  const [flakeEdit, setFlakeEdit] = useState<string>('')

  useEffect(() => {
    if (!config) {
      return
    }

    setNetworkEdit(config.network ?? 'host')
    setFlakeEdit(config.flake)
  }, [config])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit {container}</DialogTitle>
        <DialogDescription>Edit app configuration</DialogDescription>
      </DialogHeader>
      {config && (
        <div className="flex flex-col gap-2">
          <Item title="Network">
            <Select
              value={networkEdit}
              onValueChange={(v) => setNetworkEdit(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="host">host</SelectItem>
                <SelectItem value="containernet">containernet</SelectItem>
              </SelectContent>
            </Select>
          </Item>
          <NixEditor title="Flake" value={flakeEdit} onChange={setFlakeEdit} />
        </div>
      )}
      {config && (
        <DialogFooter>
          <Button
            onClick={() => {
              setFlakeEdit(config.flake)
              setNetworkEdit(config.network ?? 'host')
            }}
            disabled={
              flakeEdit === config.flake &&
              networkEdit === (config.network ?? 'host')
            }
          >
            Reset
          </Button>
          {session && (
            <DialogClose asChild>
              <Button
                onClick={() => {
                  set({
                    session,
                    path: { container },
                    data: {
                      settings: {
                        flake: flakeEdit,
                        network: networkEdit === 'host' ? null : networkEdit,
                        nvidia_gpus: [0],
                      },
                      update_inputs: null,
                    },
                  })
                }}
              >
                Apply
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      )}
    </>
  )
}

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{title}</Label>
      {children}
    </div>
  )
}
