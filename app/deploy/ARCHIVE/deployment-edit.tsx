'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCcw } from 'lucide-react'

import {
  serviceByName,
  type ServiceData,
  type ServiceOption,
} from '@/types/dataProvider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ServiceOptionRow } from '../xnode/service-options'
import { useDeploymentContext } from './deployment-context'

export function DeploymentEdit({ disabled }: { disabled?: boolean }) {
  const { config, setConfig } = useDeploymentContext()
  const [open, setOpen] = useState<boolean>(false)

  const [serviceChanges, setServiceChanges] = useState<
    Map<ServiceData['nixName'], ServiceOption[]>
  >(new Map())

  const defaultOptions = useMemo(() => {
    const defaultOptions = new Map<
      `${ServiceData['nixName']}_${ServiceOption['nixName']}`,
      ServiceOption['value']
    >()
    if (!config.services) return defaultOptions
    const defaultServices = config.services.map((service) =>
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
  }, [config.services])

  const changedOptions = useMemo(() => {
    const changes: Record<ServiceData['nixName'], ServiceOption['nixName'][]> =
      {}
    if (!config.services) return changes

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
    for (const service of config.services ?? []) {
      const options = serviceChanges.get(service.nixName) ?? service.options
      addChanges(service.nixName, options)
    }
    return changes
  }, [defaultOptions, serviceChanges, config.services])

  const [serviceInEditIndex, setServiceInEditIndex] = useState<number>(0)
  const serviceInEdit = config.services[serviceInEditIndex]

  useEffect(() => {
    config.services.forEach((service) => {
      let newMap = new Map(serviceChanges)
      newMap.set(service.nixName, service.options)
      setServiceChanges(newMap)
    })
  }, [config.services])

  return (
    <>
      <Button
        size="lg"
        className="h-10 min-w-40"
        variant="outlinePrimary"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Edit
      </Button>
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
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
                              return changedServiceOptions.includes(opt.nixName)
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
                            ?.options?.find((opt) => opt.nixName === nixName)
                            ?.value
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
                          if (opt.nixName === (parentOption ?? currentOption)) {
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
                      !changedOptions[serviceInEdit.nixName]?.includes(nixName)
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
                setOpen(false)
              }}
              className="min-w-28"
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={() => {
                try {
                  setOpen(false)
                  setConfig({
                    ...config,
                    services: config.services.map((s, i) => {
                      if (i === serviceInEditIndex) {
                        return { ...s, options: serviceChanges.get(s.nixName) }
                      }

                      return s
                    }),
                  })
                } catch (err) {
                  console.error(err)
                }
              }}
              className="min-w-48"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
