import ServiceDefinitions from 'utils/service-definitions.json'
import TemplateDefinitions from 'utils/template-definitions.json'
import ModelDefinitions from 'utils/model-definitions.json'
import { z } from 'zod'

import { opensshConfig } from '@/config/openssh'

// NOTE: A "template product" is a baremetal offering from a provider.
export type TemplatesProducts = {
  id: string
  providerName?: string
  productName?: string
  location?: string
  cpuCores?: string
  cpuThreads?: string
  cpuGHZ?: string
  hasSGX?: string
  ram?: string
  numberDrives?: string
  avgSizeDrive?: string
  storageTotal?: string
  gpuType?: string
  gpuMemory?: string
  bandwidthNetwork?: string
  network?: string
  priceHour?: string
  priceMonth?: string
  priceSale?: string
  availability?: string
  source?: string
  unit?: string
}

export type DeploymentConfiguration = {
  name: string
  description: string
  location?: string
  provider?: string
  isUnit?: boolean
  // Either the api key or the NFT id.
  deploymentAuth?: string

  // An array to all the service ids being looked at.
  services: ServiceData[]
}

export type XnodeConfig = {
  services: ServiceData[]
  'users.users': ServiceData[]
  // Can add any other modules available in nix following the Module and Option format.
  // "ModuleType" : ModuleData[]
}

export type ServiceOption = {
  name: string
  desc: string

  // Nix name for the option.
  nixName: string

  // One of: "string", "int", "float", "bool"
  type: 'string' | 'int' | 'float' | 'bool' | string
  value?: string

  // Suboptions for nested options.
  options?: ServiceOption[]
}

export type Specs = {
  // cores: number
  ram: number
  storage: number
}

export type ServiceData = {
  name: string
  tags: string[]
  specs?: Specs
  desc: string
  longDesc?: string
  useCases?: string
  support?: string
  website?: string
  // Url to the logo.
  logo?: string
  implemented?: boolean

  nixName: string
  options: ServiceOption[]
  flakes?: {
    name: string
    url: string
  }[]
}

type TemplateData = {
  id: string
  name: string
  desc: string
  longDesc?: string
  useCases?: string
  support?: string
  tags: string[]
  quality?: boolean
  isUnitRunnable?: boolean
  source?: string
  website?: string
  implemented?: boolean
  // Url to image.
  logo: string
  category: string
  dateAdded: string
  // An array to all the service ids being looked at.
  serviceNames: string[]
}

export const appStorePageType = z.enum(['templates', 'use-cases', 'advanced'])
export type AppStorePageType = z.infer<typeof appStorePageType>
export type AppStoreItem = {
  id: string
  name: string
  desc: string
  longDesc?: string
  useCases?: string
  support?: string
  tags: string[]
  implemented?: boolean
  logo?: string
  category?: string
  serviceNames?: string[]
}

export interface HardwareProduct {
  type: 'VPS' | 'Bare Metal'
  id: string
  available: number
  productName: string
  providerName: string
  location: string
  price: { [duration: string]: number }
  cpu: { cores: number; threads?: number; ghz?: number; name?: string }
  ram: { capacity: number; ghz?: number }
  storage: { capacity: number; type?: string }[]
  gpu: { vram: number; type?: string }[]
  network: { speed?: number; max_usage?: number }
}

let serviceMap: Map<string, ServiceData> = null
export function serviceByName(name: string): ServiceData | undefined {
  if (serviceMap == null) {
    serviceMap = new Map<string, ServiceData>()

    // Comment out service definitions for now
    /* for (let i = 0; i < ServiceDefinitions.length; i++) {
      const service = ServiceDefinitions[i]
      if (service === undefined) continue
      serviceMap.set(ServiceDefinitions[i].nixName, service)
    } */

    // Only use model definitions
    for (let i = 0; i < ModelDefinitions.length; i++) {
      const model = ModelDefinitions[i]
      if (model === undefined) continue
      serviceMap.set(model.nixName, model)
    }
  }
  // Comment out openssh config for now
  // serviceMap.set(opensshConfig.nixName, opensshConfig)
  return serviceMap.get(name)
}

let templateMap: Map<string, TemplateData> = null
export function usecaseById(id: string): TemplateData | undefined {
  if (templateMap == null) {
    templateMap = new Map<string, TemplateData>()

    for (let i = 0; i < TemplateDefinitions.length; i++) {
      templateMap.set(TemplateDefinitions[i].id, TemplateDefinitions[i])
    }
  }

  return templateMap.get(id)
}

export function getSpecsByTemplate(template: TemplateData): Specs {
  let specs: Specs = { ram: 0, storage: 0 }

  for (let i = 0; i < template.serviceNames.length; i++) {
    // Get service id from .
    const service = serviceByName(template.serviceNames[i])
    if (service) {
      // specs.cores += service.specs.cores
      specs.ram += service.specs.ram
      specs.storage += service.specs.storage
    } else {
      console.log(template.serviceNames[i])
      // XXX: Need a test to quality check all templates ahead of time.
      console.log("This shouldn't run")
    }
  }

  return specs
}

export function tagsByTemplate(template: TemplateData): string[] {
  let ret: string[] = []

  for (let i = 0; i < template.serviceNames.length; i++) {
    // Get service id from .
    const service = serviceByName(template.serviceNames[i])
    if (service) {
      // specs.cores += service.specs.cores
      for (let j = 0; j < service.tags.length; j++) {
        ret.push(service.tags[j])
      }
    } else {
      // XXX: Need a test to quality check all templates ahead of time.
      console.log("This shouldn't run")
    }
  }

  return ret
}
