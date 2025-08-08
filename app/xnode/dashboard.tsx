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
import Skeleton_deployment from './skeleton'


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



  const [user] = useUser()
  const { toast } = useToast()
  const { push } = useRouter()
  // just for testing purposes, remove later
  // const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(true);
  // useEffect(() => {

  //     const timer = setTimeout(() => {
  //       setIsLoadingSkeleton(false);
  //     }, 3000);

  //     return () => clearTimeout(timer); 
  //   }, []);
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
  return (
    <div className="container mx-auto mb-12 mt-0  max-w-screen-3xl ">
      {isLoading && !demoMode ? (
        <Skeleton_deployment />
      ) : null}
      {(isSuccess || demoMode) && user?.sessionToken ? (
        <>

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

          {/* ---------------------------- New code based on new UI ----------------------------------------------- */}


          <div className="flex w-full  flex-col gap-6 bg-white py-6 ">

            <div className="mb-4 flex items-center space-x-2">
              <span className="text-lg text-[#8F8F8F]">Deployment</span>
              <ChevronRight size={20} className="text-[#9B9B9B]" />
              <span className="text-lg font-medium text-[#525252]">
                {xNode.name}
              </span>
            </div>
            <PlanManagement xnode={xNode} />

          </div>
          <Resources xNode={xNode} lastUpdated={lastUpdated} />

          <Deployed_Apps services={services?.services} xNode={xNode} setDeleteServiceOpen={setDeleteServiceOpen} />

        </>
      ) : null}
      {!isFetching && !isSuccess && !demoMode ? <Signup /> : null}
    </div>
  )
}
