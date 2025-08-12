'use client'

import { useMemo } from 'react'
import { xnode } from '@openmesh-network/xnode-manager-sdk'
import { useInfoFlake } from '@openmesh-network/xnode-manager-sdk-react'
import { CheckCircle, Hourglass, TriangleAlert } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export interface NixLock {
  nodes: {
    [input: string]: {
      inputs?: { [input: string]: string | string[] }
      locked?: {
        lastModified: number
        narHash: string
        owner: string
        repo: string
        rev: string
        type: string
      }
      original?: {
        owner: string
        repo: string
        ref?: string
        type: string
      }
    }
  }
  root: string
  version: number
}

export function NixUpdatable({
  session,
  lock,
  input,
  selected,
  setSelected,
}: {
  session?: xnode.utils.Session
  lock: NixLock
  input: string
  selected: boolean
  setSelected: (selected: boolean) => void
}) {
  const current = useMemo(() => lock.nodes[input], [lock.nodes, input])
  const flake = useMemo(
    () =>
      current.original
        ? `${current.original.type}:${current.original.owner}/${
            current.original.repo
          }${current.original.ref ? `/${current.original.ref}` : ''}`
        : undefined,
    [current.original]
  )
  const { data: latest } = useInfoFlake({
    session,
    flake,
  })

  const updatable = useMemo(() => {
    if (!current.locked || !latest?.revision) {
      return undefined
    }

    return current.locked.rev !== latest.revision
  }, [current.locked, latest?.revision])

  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id={`update-${input}`}
        checked={selected}
        onCheckedChange={(c) => {
          if (c !== 'indeterminate') {
            setSelected(c)
          }
        }}
        disabled={updatable === false}
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={`update-${input}`}
          className="flex gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          <span>{input}</span>
          {updatable === undefined ? (
            <Hourglass className="size-4" />
          ) : updatable ? (
            <TriangleAlert className="size-4 text-red-600" />
          ) : (
            <CheckCircle className="size-4 text-green-600" />
          )}
        </Label>
        {current.original && (
          <span className="text-sm text-muted-foreground">
            Tracking {current.original.type}:{current.original.owner}/
            {current.original.repo}
            {current.original.ref ? `/${current.original.ref}` : ''}
          </span>
        )}
        {current.locked && (
          <span className="text-sm text-muted-foreground">
            Current version:{' '}
            {new Date(current.locked.lastModified * 1000).toLocaleString()}
          </span>
        )}
        {latest && (
          <span className="text-sm text-muted-foreground">
            Latest version:{' '}
            {latest.last_modified
              ? new Date(latest.last_modified * 1000).toLocaleString()
              : 'unknown'}
          </span>
        )}
      </div>
    </div>
  )
}

export function FileUpdatable({
  current,
  latest,
  selected,
  setSelected,
}: {
  session?: xnode.utils.Session
  current?: string
  latest?: string
  selected: boolean
  setSelected: (selected: boolean) => void
}) {
  const updatable = useMemo(() => {
    if (current === undefined || latest === undefined) {
      return undefined
    }

    return current !== latest
  }, [current, latest])

  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id="update-config"
        checked={selected}
        onCheckedChange={(c) => {
          if (c !== 'indeterminate') {
            setSelected(c)
          }
        }}
        disabled={updatable === false}
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="update-config"
          className="flex gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          <span>Update Config</span>
          {updatable === undefined ? (
            <Hourglass className="size-4" />
          ) : updatable ? (
            <TriangleAlert className="size-4 text-red-600" />
          ) : (
            <CheckCircle className="size-4 text-green-600" />
          )}
        </Label>
      </div>
    </div>
  )
}
