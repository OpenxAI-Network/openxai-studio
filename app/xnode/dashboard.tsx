'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { prefix } from '@/utils/prefix'
import { servicesCompressedForAdmin } from '@/utils/xnode'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import axios, { AxiosError } from 'axios'
import { addYears, formatDistanceToNowStrict } from 'date-fns'


import { useUser } from 'hooks/useUser'
import { useAccount } from 'wagmi'
import Deployed_Apps from './deployed-apps'

import {
  Copy,
  Edit3,
  ExternalLink,
  HelpCircle,
  Pencil,
  RefreshCcw,
  Trash2,
} from 'lucide-react'

import {
  serviceByName,
  type ServiceData,
  type ServiceOption,
  type XnodeConfig,
} from '@/types/dataProvider'
import { type Xnode } from '@/types/node'
import { mockXNodes } from '@/config/demo-mode'
import { cn, formatXNodeName } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { SimpleTooltip } from '@/components/Common/SimpleTooltip'
import { useDemoModeContext } from '@/components/demo-mode'
import Signup from '@/components/Signup'
import PlanManagement from './planManagement'
import Resources from './resources'
import { ServiceOptionRow } from './service-options'
import { ChevronRight } from 'lucide-react';




type XnodePageProps = {
  xNodeId: string
}

export default function XNodeDashboard({ xNodeId }: XnodePageProps) {
  const { address } = useAccount()
  const { demoMode } = useDemoModeContext()
  const testXNode = useMemo<Xnode | null>(() => {
    if (!demoMode) return null
    return mockXNodes.find((node) => node.id === xNodeId) ?? null
  }, [demoMode, xNodeId])
  const [processesOpen, setProcessesOpen] = useState(false);
  const [appEditOpen, setAppEditOpen] = useState(false);
  const [currentContainer, setCurrentContainer] = useState('');


  const [user] = useUser()
  const { toast } = useToast()
  const { push } = useRouter()

  const {
    data: xNodeData,
    isSuccess,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useQuery<Xnode>({
    queryKey: ['xnodes', xNodeId],
    queryFn: async () => {
      if (resetting) return xNodeData

      if (!user?.sessionToken) return null
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/getXnode`,
        {
          method: 'POST',
          headers: {
            'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
            'X-Parse-Session-Token': user.sessionToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: xNodeId,
          }),
        }
      ).then((res) => res.json())
      return {
        ...data,
        heartbeatData:
          data.heartbeatData !== null
            ? JSON.parse(data.heartbeatData as any as string)
            : null,
      }
    },
    refetchInterval: 10 * 1000,
    enabled: !!user?.sessionToken && !demoMode,
  })
  const xNode = testXNode ?? xNodeData

  const [lastUpdated, setLastUpdated] = useState<string>('0 seconds')

  function reloadLastUpdated(updatedAt: number) {
    if (updatedAt === 0) return
    setLastUpdated(formatDistanceToNowStrict(updatedAt))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      reloadLastUpdated(dataUpdatedAt)
    }, 1000)
    return () => clearInterval(interval)
  }, [dataUpdatedAt])

  const services = useMemo<XnodeConfig | null>(() => {
    if (!xNode?.services) return null
    return JSON.parse(
      Buffer.from(xNode?.services, 'base64').toString('utf-8')
    ) as XnodeConfig
  }, [xNode?.services])

  const [serviceChanges, setServiceChanges] = useState<
    Map<ServiceData['nixName'], ServiceOption[]>
  >(new Map())

  const defaultOptions = useMemo(() => {
    const defaultOptions = new Map<
      `${ServiceData['nixName']}_${ServiceOption['nixName']}`,
      ServiceOption['value']
    >()
    if (!services?.services) return defaultOptions
    const defaultServices = services?.services.map((service) =>
      serviceByName(service.nixName)
    )
    function getDefaultOptions(
      serviceName: ServiceData['nixName'],
      options: ServiceOption[]
    ) {
      for (const option of options) {
        if (option.options) {
          getDefaultOptions(serviceName, option.options)
        } else {
          defaultOptions.set(`${serviceName}_${option.nixName}`, option.value)
        }
      }
    }
    for (const service of defaultServices) {
      if (!service?.options) continue
      getDefaultOptions(service.nixName, service.options)
    }
    return defaultOptions
  }, [services?.services])

  const changedOptions = useMemo(() => {
    const changes: Record<ServiceData['nixName'], ServiceOption['nixName'][]> =
      {}
    if (!services?.services) return changes

    function addChanges(
      serviceName: ServiceData['nixName'],
      options: ServiceOption[]
    ) {
      for (const option of options) {
        if (option.options) {
          addChanges(serviceName, option.options)
        } else if (
          option.value !==
          defaultOptions.get(`${serviceName}_${option.nixName}`)
        ) {
          if (!changes[serviceName]) changes[serviceName] = []
          changes[serviceName].push(option.nixName)
        }
      }
    }
    for (const service of services?.services ?? []) {
      const options = serviceChanges.get(service.nixName) ?? service.options
      addChanges(service.nixName, options)
    }
    return changes
  }, [defaultOptions, serviceChanges, services?.services])

  const [editService, setEditService] = useState<ServiceData['nixName'] | null>(
    null
  )
  const serviceInEdit = useMemo<ServiceData | null>(() => {
    if (!editService || !services) return null
    return (
      services.services.find((service) => service.nixName === editService) ??
      null
    )
  }, [editService, services])
  const [deleteServiceOpen, setDeleteServiceOpen] = useState<
    ServiceData['nixName'] | null
  >(null)
  const [resetMachineOpen, setResetMachineOpen] = useState<boolean>(false)
  const [resetting, setResetting] = useState<boolean>(false)
  const [editName, setEditName] = useState<string | undefined>(undefined)
  const [changingName, setChangingName] = useState<boolean>(false)

  const updateServices = useCallback(async () => {
    if (demoMode) return
    if (!services?.services || !user?.sessionToken) return
    const servicesWithChanges = services.services.map((service) => {
      const changes = serviceChanges.get(service.nixName)
      if (!changes) return service
      return {
        ...service,
        options: changes,
      }
    })
    const formattedServices = servicesCompressedForAdmin(servicesWithChanges)

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/pushXnodeServices`,
      {
        method: 'POST',
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': user.sessionToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: xNodeId,
          services: Buffer.from(
            JSON.stringify({
              services: formattedServices,
            })
          ).toString('base64'),
        }),
      }
    )
    await new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
      refetch()
    )
  }, [
    demoMode,
    refetch,
    serviceChanges,
    services?.services,
    user?.sessionToken,
    xNodeId,
  ])


  const deleteService = useCallback(async () => {
    if (demoMode) return
    if (!services?.services || !user?.sessionToken) return
    const servicesWithChanges = services.services.filter(
      (service) => service.nixName !== deleteServiceOpen
    )
    const formattedServices = servicesCompressedForAdmin(servicesWithChanges)

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/pushXnodeServices`,
      {
        method: 'POST',
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': user.sessionToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: xNodeId,
          services: Buffer.from(
            JSON.stringify({
              services: formattedServices,
            })
          ).toString('base64'),
        }),
      }
    )
    setDeleteServiceOpen(null)
    await new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
      refetch()
    )
  }, [
    demoMode,
    deleteServiceOpen,
    refetch,
    services?.services,
    user?.sessionToken,
    xNodeId,
  ])

  async function updateXNode() {
    if (demoMode) return
    if (!user?.sessionToken || !xNode) return
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/allowXnodeGenerationUpdate`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
        'X-Parse-Session-Token': user.sessionToken,
        'Content-Type': 'application/json',
      },
      data: {
        id: xNodeId,
        generation: xNode.updateGenerationWant + 1,
      },
    }

    await axios(config)
    await new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
      refetch()
    )
  }

  const [apiKey, setApiKey] = useState<string>('')
  const debouncedApiKey = useDebounce(apiKey, 500)
  const { data: validApiKey } = useQuery({
    queryKey: ['apiKey', debouncedApiKey, demoMode, xNodeData?.provider ?? ''],
    queryFn: async () => {
      if (demoMode) {
        return true
      }

      if (!debouncedApiKey) {
        return undefined
      }

      try {
        if (xNodeData?.provider === 'Hivelocity') {
          await axios.get(`${prefix}/api/hivelocity/rewrite`, {
            params: {
              path: 'v2/profile/',
              method: 'GET',
            },
            headers: {
              'X-API-KEY': debouncedApiKey,
            },
          })
        } else if (xNodeData?.provider === 'Vultr') {
          await axios.get(`${prefix}/api/vultr/rewrite`, {
            params: {
              path: 'v2/users',
              method: 'GET',
            },
            headers: {
              Authorization: `Bearer ${debouncedApiKey}`,
            },
          })
        }
        return true
      } catch (err) {
        return false
      }
    },
  })

  const resetMachine = useCallback(async () => {
    if (demoMode) return
    if (!xNodeData || !user?.sessionToken) return

    setResetting(true)
    try {
      if (xNodeData.isUnit) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/createXnode`,
          {
            method: 'POST',
            headers: {
              'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
              'X-Parse-Session-Token': user.sessionToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: xNodeData.name,
              location: xNodeData.location,
              description: xNodeData.description,
              provider: xNodeData.provider,
              isUnit: xNodeData.isUnit,
              deploymentAuth: xNodeData.deploymentAuth,
              services: xNodeData.services,
            }),
          }
        )
      } else {
        if (xNodeData.provider === 'Hivelocity') {
          await axios
            .get(`${prefix}/api/hivelocity/rewrite`, {
              params: {
                path: `v2/${xNodeData.deploymentAuth}`,
                method: 'DELETE',
              },
              headers: {
                'X-API-KEY': debouncedApiKey,
              },
            })
            .catch((err) => {
              if (err instanceof AxiosError) {
                if (
                  err.status.toString().startsWith('2') ||
                  err.status === 409 /*Device already cancelled*/ ||
                  err.response?.data?.error ===
                  'Response constructor: Invalid response status code 204' ||
                  err.response?.data?.error?.at(0) === 'Resource not Found.' // Already deleted
                ) {
                  return
                }
              }

              throw 'An unexpected error occurred, please check your provider directly if the server has been successfully deleted.'
            })
        } else if (xNodeData.provider === 'Vultr') {
          await axios
            .get(`${prefix}/api/vultr/rewrite`, {
              params: {
                path: `v2/${xNodeData.deploymentAuth}`,
                method: 'DELETE',
              },
              headers: {
                Authorization: `Bearer ${debouncedApiKey}`,
              },
            })
            .catch((err) => {
              if (err instanceof AxiosError) {
                if (
                  err.status.toString().startsWith('2') ||
                  err.response?.data?.error ===
                  'Response constructor: Invalid response status code 204'
                ) {
                  return
                }
              }

              throw 'An unexpected error occurred, please check your provider directly if the server has been successfully deleted.'
            })
        } else {
          throw `Deleting servers through Xnode Studio is not yet supported for ${xNodeData.provider}`
        }

        await fetch(
          `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/removeXnodeDeployment`,
          {
            method: 'DELETE',
            headers: {
              'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
              'X-Parse-Session-Token': user.sessionToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: xNodeData.id,
            }),
          }
        )
      }

      push('/deployments')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description:
          typeof err === 'string' ? err : 'An unknown error has occurred',
        variant: 'destructive',
      })
    } finally {
      setResetting(false)
    }
  }, [demoMode, refetch, user?.sessionToken, xNodeData, debouncedApiKey])

  const changeName = useCallback(
    async (name: string) => {
      if (demoMode) return
      if (!xNodeData || !user?.sessionToken) return

      setChangingName(true)
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/updateXnode`,
          {
            method: 'PUT',
            headers: {
              'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
              'X-Parse-Session-Token': user.sessionToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              xnodeId: xNodeData.id,
              name: name,
            }),
          }
        )

        await new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
          refetch()
        )
      } finally {
        setChangingName(false)
      }
    },
    [demoMode, refetch, user?.sessionToken, xNodeData]
  )

  console.log("Xnode ==>", xNode)


  return (
    <div className="container max-w-[1920px] my-12  mx-auto ">
      {isLoading && !demoMode ? (
        <div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-9 w-64" />
          <div className="flex gap-2">
            <Skeleton className="mt-2 h-7 w-24" />
            <Skeleton className="mt-2 h-7 w-80" />
          </div>
          <div className="mt-6 rounded border p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Skeleton className="h-6 w-28" />
                <Skeleton className="mt-1 h-4 w-40" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
          <div className="mt-6 rounded border p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Skeleton className="h-6 w-28" />
                <Skeleton className="mt-1 h-4 w-40" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-5 w-32" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-5 w-32" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-5 w-32" />
                  </TableHead>
                  <TableHead>
                    <span />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="size-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex gap-2">
                        <Skeleton className="size-4" />
                        <Skeleton className="size-4" />
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
      {(isSuccess || demoMode) && user?.sessionToken ? (
        <>
          <Dialog
            open={!!editService}
            onOpenChange={() => setEditService(null)}
          >
            <DialogContent className="max-w-screen-lg">
              <DialogHeader>
                <DialogTitle>
                  {serviceInEdit?.name ?? serviceInEdit?.nixName}
                </DialogTitle>
                <DialogDescription>
                  Edit the configuration of the selected service.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[32rem] overflow-y-auto">
                {/* eslint-disable-next-line tailwindcss/migration-from-tailwind-2 */}
                <Table className="w-full overflow-clip rounded">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8">Name</TableHead>
                      {/* <TableHead className="h-8">Description</TableHead> */}
                      <TableHead className="h-8">Value</TableHead>
                      <TableHead className="h-8 w-16">
                        <Button
                          disabled={
                            serviceInEdit
                              ? !changedOptions[serviceInEdit.nixName]
                              : true
                          }
                          size="sm"
                          variant="outlinePrimary"
                          className="h-7 gap-1"
                          onClick={() => {
                            setServiceChanges((prev) => {
                              if (!serviceInEdit) return prev
                              const newMap = new Map(prev)
                              const existingChanges = newMap.get(
                                serviceInEdit.nixName
                              )
                              const changedServiceOptions =
                                changedOptions[serviceInEdit.nixName]

                              const updateOptionsRecursively = (
                                options: ServiceOption[]
                              ) => {
                                return options.map((opt) => {
                                  if (opt.options) {
                                    opt.options = updateOptionsRecursively(
                                      opt.options
                                    )
                                    return opt
                                  }
                                  return changedServiceOptions.includes(
                                    opt.nixName
                                  )
                                    ? {
                                      ...opt,
                                      value: defaultOptions.get(
                                        `${serviceInEdit.nixName}_${opt.nixName}`
                                      ),
                                    }
                                    : opt
                                })
                              }

                              newMap.set(
                                serviceInEdit.nixName,
                                updateOptionsRecursively(
                                  existingChanges ?? serviceInEdit.options
                                )
                              )
                              return newMap
                            })
                          }}
                        >
                          <RefreshCcw className="size-3.5" />
                          Reset
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceInEdit?.options?.map((option) => (
                      <ServiceOptionRow
                        key={option.nixName}
                        option={option}
                        value={(nixName, parentOption) => {
                          return parentOption
                            ? serviceChanges
                              .get(serviceInEdit.nixName)
                              ?.find((opt) => opt.nixName === parentOption)
                              ?.options?.find(
                                (opt) => opt.nixName === nixName
                              )?.value
                            : serviceChanges
                              .get(serviceInEdit.nixName)
                              ?.find((opt) => opt.nixName === nixName)?.value
                        }}
                        onUpdate={(newVal, currentOption, parentOption) => {
                          setServiceChanges((prev) => {
                            const newMap = new Map(prev)
                            const existingChanges = newMap.get(
                              serviceInEdit.nixName
                            )
                            const newChanges = (
                              existingChanges ?? serviceInEdit.options
                            )?.map((opt) => {
                              if (
                                opt.nixName === (parentOption ?? currentOption)
                              ) {
                                if (parentOption && opt.options) {
                                  opt.options = opt.options.map((subOpt) =>
                                    subOpt.nixName === currentOption
                                      ? { ...subOpt, value: newVal }
                                      : subOpt
                                  )
                                } else {
                                  return { ...opt, value: newVal }
                                }
                              }
                              return opt
                            })
                            newMap.set(serviceInEdit.nixName, newChanges)
                            return newMap
                          })
                        }}
                        canReset={(nixName) =>
                          !changedOptions[serviceInEdit.nixName]?.includes(
                            nixName
                          )
                        }
                        onReset={(option, parentOption) => {
                          setServiceChanges((prev) => {
                            const newMap = new Map(prev)
                            const existingChanges = newMap.get(
                              serviceInEdit.nixName
                            )
                            const newChanges = (
                              existingChanges ?? serviceInEdit.options
                            )?.map((opt) => {
                              if (opt.nixName === (parentOption ?? option)) {
                                if (parentOption && opt.options) {
                                  opt.options = opt.options.map((subOpt) =>
                                    subOpt.nixName === option
                                      ? {
                                        ...subOpt,
                                        value: defaultOptions.get(
                                          `${serviceInEdit.nixName}_${option}`
                                        ),
                                      }
                                      : subOpt
                                  )
                                } else {
                                  return {
                                    ...opt,
                                    value: defaultOptions.get(
                                      `${serviceInEdit.nixName}_${option}`
                                    ),
                                  }
                                }
                              }
                              return opt
                            })
                            newMap.set(serviceInEdit.nixName, newChanges)
                            return newMap
                          })
                        }}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setEditService(null)
                  }}
                  className="min-w-28"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    setEditService(null)
                    updateServices()
                  }}
                  className="min-w-48"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog
            open={!!deleteServiceOpen}
            onOpenChange={() => setDeleteServiceOpen(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete {deleteServiceOpen}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone and you will need to reinstall
                  the service if you want to use it again.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteService()}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog
            open={!!resetMachineOpen}
            onOpenChange={() => setResetMachineOpen(false)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to {xNode.isUnit ? 'reset' : 'delete'}{' '}
                  your machine?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {xNode.isUnit
                    ? 'This will delete all data storage of your applications. The nix configuration will be migrated to a new hardware machine.'
                    : 'The underlying hardware will be deleted, which will cancel any future renting costs. This Xnode will cease to exist and cannot be restored.'}{' '}
                  This action cannot be undone.
                </AlertDialogDescription>
                {!xNode.isUnit && (
                  <div>
                    <div className="mt-2 space-y-0.5">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        name="apiKey"
                        value={apiKey}
                        className={
                          validApiKey === false
                            ? 'border-red-600'
                            : validApiKey === true
                              ? 'border-green-500'
                              : ''
                        }
                        onChange={(e) => setApiKey(e.target.value)}
                        type="password"
                      />
                    </div>
                    {validApiKey === false && (
                      <p className="text-sm text-red-700">Invalid API key</p>
                    )}
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => resetMachine()}
                    disabled={!xNode.isUnit && !validApiKey}
                  >
                    {xNode.isUnit ? 'Reset' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={resetting}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {xNode.isUnit ? 'Resetting...' : 'Deleting...'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Please wait. You will be redirected to the deployment page.{' '}
                  {xNode.isUnit
                    ? 'Your new server will show up once the new machine has been provisioned. This can take several minutes.'
                    : ''}
                </AlertDialogDescription>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog
            open={editName !== undefined}
            onOpenChange={() => setEditName(undefined)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Xnode Name</DialogTitle>
                <DialogDescription>
                  This name is purely cosmetic and does not affect the running
                  Xnode in any way.
                </DialogDescription>
                <div>
                  <Label htmlFor="newXnodeName">New Xnode Name</Label>
                  <Input
                    id="newXnodeName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => setEditName(undefined)}
                    disabled={changingName}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      changeName(editName)
                        .catch(console.error)
                        .finally(() => setEditName(undefined))
                    }}
                    disabled={changingName}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          {xNode.heartbeatData?.wantUpdate &&
            xNode.updateGenerationHave == xNode.updateGenerationWant &&
            xNode.status === 'online' ? (
            <div className="fixed inset-x-0 bottom-8 z-30 flex justify-center">
              <div className="flex flex-wrap items-center justify-between gap-12 rounded border border-primary bg-[color-mix(in_srgb,hsl(var(--background)),hsl(var(--primary))_5%)] px-6 py-4 shadow-xl">
                <div>
                  <p className="text-lg font-bold">Update available</p>
                  <p className="max-w-96 text-balance text-sm text-muted-foreground">
                    There is an update available for your Xnode. Please make
                    sure to keep everything up to date, by allowing updates.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="min-w-32"
                  onClick={() => updateXNode()}
                >
                  Update
                </Button>
              </div>
            </div>
          ) : null}
          {/* <TooltipProvider>
            <Tooltip open={!xNode.isUnit ? false : undefined}>
              <TooltipTrigger className="flex items-start gap-0.5 font-medium text-muted-foreground">
                {formatXNodeName(xNode)}
                {xNode.isUnit && <HelpCircle className="size-3.5" />}
              </TooltipTrigger>
              <TooltipContent className="max-w-80">
                <p className="text-base font-semibold">Xnode NFT</p>
                <p className="break-all text-muted-foreground">
                  {xNode.deploymentAuth}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
          {/* <Button
            className="size-auto gap-x-2 bg-transparent p-0 hover:bg-transparent"
            onClick={() => setEditName(xNode.name)}
          >
            <h1 className="text-4xl font-bold text-black">{xNode.name}</h1>
            
            <Edit3 className="size-7 text-muted-foreground" />
          </Button> */}
          <div className="bg-white py-6  w-full flex flex-col gap-6 ">

            {/* <div className="flex justify-between items-start">

              <div className="flex items-center gap-3">

                <img src="/images/viewDeployment/xnode.svg" alt="XNode" className="w-14 h-14" />


                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-[#000000]">
                      {xNode.name}

                      <img src="/images/viewDeployment/ollama.svg" alt="" />
                    </h2>
                  </div>
                  <p className="text-sm text-[#8F8F8F]">
                    {xNode?.cores} cores,{' '}
                    {xNode?.ram ? Math.round(xNode.ram / 1024 ** 3) : 0}GB RAM,{' '}
                    {xNode?.storage
                      ? xNode.storage >= 1024 ** 4
                        ? `${(xNode.storage / 1024 ** 4).toFixed(1)}PB`
                        : xNode.storage >= 1024 ** 3
                          ? `${(xNode.storage / 1024 ** 3).toFixed(0)}TB`
                          : `${(xNode.storage / 1024 ** 2).toFixed(0)}GB`
                      : '0GB'}{' '}
                    Storage, {xNode?.gpu} GPU
                  </p>
                </div>
              </div>

              <button className="flex items-center bg-[#0059FF] text-white px-4 py-2 rounded-md text-sm font-[400]">
                Push to Marketplace
                <ArrowUpRight className="ml-2" />
              </button>

            </div> */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[#8F8F8F] text-lg">Deployment</span>
              <ChevronRight size={20} className="text-[#9B9B9B]" />
              <span className="text-[#525252] font-medium text-lg">
                {xNode.name}
              </span>
            </div>
            <PlanManagement xnode={xNode} />
            {/* <div className="flex flex-col gap-4 max-w-[70%]">

              <div className="flex items-center justify-between">
                <span className="text-[#1B1A1E] truncate max-w-[65px] font-medium">{address}</span>
                <button className="bg-[#0059FF] text-white px-4 py-2 rounded-md text-sm w-[140px] font-[400]">
                  Transfer
                </button>
              </div>

              {xNode.isUnit && (
                <div className="flex items-center justify-between ">
              
                  <span className='text-[#1B1A1E] font-medium'> Paid For {""}
                    {formatDistanceToNowStrict(addYears(xNode.unitClaimTime, 1), {
                      unit: 'day',
                    })}
                  </span>
                  <button className="bg-[#0059FF] text-white px-4 py-2 rounded-md text-sm w-[140px] font-[400]">
                    Extend / Renew
                  </button>

                </div>

              )}
            </div> */}
          </div>
          <div className="mt-2 flex items-center gap-3">
            {/* <span
              className={cn(
                'rounded border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-sm font-medium capitalize text-orange-500',
                xNode.status === 'online' &&
                  'border-green-600/25 bg-green-600/10 text-green-600',
                xNode.status === 'booting' &&
                  'border-destructive/25 bg-destructive/10 text-destructive',
                xNode.status === undefined && 'bg-muted text-foreground'
              )}
            >
              {xNode.status}
            </span>
            {xNode.ipAddress && (
              <div className="flex gap-1.5 rounded border px-2.5 py-1 text-sm font-medium text-muted-foreground">
                <span>IP address</span>
                <div className="my-0.5">
                  <Separator orientation="vertical" />
                </div>
                <SimpleTooltip tooltip="Copy to clipboard">
                  <Button
                    onClick={() => {
                      navigator.clipboard
                        .writeText(`${xNode.ipAddress}`)
                        .then(() => {
                          toast({
                            title: 'Success',
                            description: 'IP address copied to clipboard.',
                          })
                        })
                        .catch((err) => {
                          toast({
                            title: 'Error',
                            description:
                              err?.message ??
                              'Could not copy IP address to clipboard.',
                          })
                        })
                    }}
                    className="size-auto gap-x-1 bg-transparent p-0 text-muted-foreground hover:bg-transparent"
                  >
                    <span>{xNode.ipAddress}</span>
                    <Copy className="size-4" />
                  </Button>
                </SimpleTooltip>
              </div>
            )} */}
            {/* {xNode.isUnit && (
              <div className="flex gap-1.5  px-2.5 py-1 text-sm font-medium text-muted-foreground">
                <span>Paid for</span>
                 <div className="my-0.5">
                   <Separator orientation="vertical" />
                </div> 
                <span>
                  {formatDistanceToNowStrict(addYears(xNode.unitClaimTime, 1), {
                    unit: 'day',
                  })}
                </span>
              </div>
            )} */}
          </div>
          {/* <div className="mt-6 rounded border px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Resources</h2>
                <p className="text-xs text-muted-foreground">
                  Last updated {lastUpdated} ago
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center gap-4 rounded border bg-muted/50 px-4 py-2.5">
                <div className="text-center">
                  <p className="font-bold">CPU</p>
                  <p className="text-sm text-muted-foreground">
                    Current CPU utilization
                  </p>
                </div>
                <HealthChartItem
                  className="size-48"
                  type="cpu"
                  healthData={xNode.heartbeatData?.cpuPercent ?? 0}
                />
              </div>
              <div className="flex flex-col items-center gap-4 rounded border bg-muted/50 px-4 py-2.5">
                <div className="text-center">
                  <p className="font-bold">RAM</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(
                      ((xNode.heartbeatData?.ramMbUsed ?? 0) / 1024) * 100
                    ) / 100}
                    GB/
                    {Math.round(
                      ((xNode.heartbeatData?.ramMbTotal ?? 0) / 1024) * 100
                    ) / 100}
                    GB
                  </p>
                </div>
                <HealthChartItem
                  className="size-48"
                  type="ram"
                  healthData={
                    ((xNode.heartbeatData?.ramMbUsed ?? 0) /
                      (xNode.heartbeatData?.ramMbTotal ?? 1)) *
                    100
                  }
                />
              </div>
              <div className="flex flex-col items-center gap-4 rounded border bg-muted/50 px-4 py-2.5">
                <div className="text-center">
                  <p className="font-bold">Storage</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(
                      ((xNode.heartbeatData?.storageMbUsed ?? 0) / 1024) * 100
                    ) / 100}
                    GB/
                    {Math.round(
                      ((xNode.heartbeatData?.storageMbTotal ?? 1) / 1024) * 100
                    ) / 100}
                    GB
                  </p>
                </div>
                <HealthChartItem
                  className="size-48"
                  type="storage"
                  healthData={
                    ((xNode.heartbeatData?.storageMbUsed ?? 0) /
                      (xNode.heartbeatData?.storageMbTotal ?? 1)) *
                    100
                  }
                />
              </div>
            </div>
          </div> */}
          <Resources xNode={xNode} lastUpdated={lastUpdated} />
          {/* <div className="mt-6 rounded border px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Apps</h2>
                <p className="text-xs text-muted-foreground">
                  See and manage all the installed apps on your Xnode.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  disabled={isFetching}
                  variant="outlinePrimary"
                  onClick={() => setResetMachineOpen(true)}
                >
                  {xNode.isUnit ? 'Reset' : 'Delete'}
                </Button>
                <Button
                  disabled={isFetching}
                  variant="outlinePrimary"
                  onClick={() => updateXNode()}
                >
                  Force Update
                </Button>
                <Link href="/app-store">
                  <Button variant="outlinePrimary">Add App</Button>
                </Link>
              </div>
            </div>
            
            <Table className="mt-4 w-full overflow-clip rounded">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="h-8">
                    <span className="sr-only">Open</span>
                  </TableHead>
                  <TableHead className="h-8">Name</TableHead>
                  <TableHead className="h-8">Version</TableHead>
                  <TableHead className="h-8">Tags</TableHead>
                  <TableHead className="h-8">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.services.map((service) => {
                  const servicePort = service.options
                    ?.flatMap((o) => {
                      const nestedOptions = [o]
                      let index = 0
                      while (nestedOptions[index].options?.length) {
                        nestedOptions.push(...nestedOptions[index].options)
                        index++
                      }
                      return nestedOptions
                    })
                    .find(
                      (option) =>
                        option.nixName === 'port' ||
                        option.nixName === 'server-port' ||
                        option.nixName === 'guiAddress'
                    )
                    ?.value?.split(':')
                    .at(-1)
                  const serviceEnabled =
                    service.options?.find(
                      (option) => option.nixName === 'enable'
                    )?.value === 'true'
                  const serviceFirewall =
                    service.options?.find(
                      (option) => option.nixName === 'openFirewall'
                    )?.value === 'true'

                  return (
                    <TableRow key={service.nixName}>
                      <TableCell>
                        <Link
                          href={`http://${xNode.ipAddress}:${servicePort}`}
                          aria-disabled={
                            !servicePort || !serviceEnabled || !serviceFirewall
                          }
                          target="_blank"
                          rel="noreferrer noopener"
                          className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        >
                          <span className="sr-only">Open</span>
                          <ExternalLink className="size-6 text-muted-foreground" />
                        </Link>
                      </TableCell>
                      <TableCell className="min-w-40">
                        <span
                          title={service.name ?? service.nixName}
                          className="truncate"
                        >
                          {service.name ?? service.nixName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-96 truncate">
                          {service.desc ?? '-'}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-56">
                        <span className="inline-flex items-center gap-1">
                          {service.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </span>
                      </TableCell>
                      <TableCell>
                        {service?.version}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center justify-end gap-2">
                          <Button
                            size="iconSm"
                            variant="outline"
                            disabled={!service.options}
                            onClick={() => setEditService(service.nixName)}
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md">Processes</button>
                          <button
                            className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md"
                            onClick={() => setProcessesOpen(true)}
                          >
                            Processes
                          </button>

                          <Processes
                            session={user?.sessionToken}
                            scope={xNodeId}
                            open={processesOpen}
                            setOpen={setProcessesOpen}
                          />
                          <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md">File Explorer</button>
                          <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md">Edit</button>
                          <button
                            className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md"
                            onClick={() => {
                              setCurrentContainer(service.nixName);
                              setAppEditOpen(true);
                            }}
                          >
                            Edit
                          </button>

                          <AppEdit
                            session={user?.session}
                            container={currentContainer}
                            open={appEditOpen}
                            setOpen={setAppEditOpen}
                          />
                          <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md">Update</button>

                          <Button
                            size="iconSm"
                            variant="outline"
                            onClick={() =>
                              setDeleteServiceOpen(service.nixName)
                            }
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div> */}
          <Deployed_Apps services={services?.services} setDeleteServiceOpen={setDeleteServiceOpen} />

        </>
      ) : null}
      {!isFetching && !isSuccess && !demoMode ? <Signup /> : null}
    </div>
  )
}
