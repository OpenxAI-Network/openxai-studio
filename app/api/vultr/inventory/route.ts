import { NextRequest } from 'next/server'

import type { HardwareProduct } from '@/types/dataProvider'

interface VultrBaseProduct {
  id: string
  ram: number
  disk: number
  disk_count: number
  bandwidth: number
  monthly_cost: number
  type: string
  locations: string[]
  gpu_vram_gb?: number
  gpu_type?: string
}

interface VultrPlanProduct extends VultrBaseProduct {
  source: 'plans'
  vcpu_count: number
}

interface VultrMetalPlanProduct extends VultrBaseProduct {
  source: 'plansmetal'
  physical_cpus: number
  cpu_count: number
  cpu_threads: number
  cpu_model: string
  monthly_cost_preemptible: number
}

type VultrProduct = VultrPlanProduct | VultrMetalPlanProduct

interface VultrLocation {
  id: string
  city: string
  country: string
  continent: string
  options: string[]
}

async function getVultrPaging(url: string, resultKey: string) {
  const results: any[] = []
  const baseUrl = `${url}?per_page=500`
  let nextUrl = baseUrl
  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: [['Authorization', `Bearer ${process.env.VULTR_API_KEY}`]],
    }).then((res) => res.json())
    let resultValue = res[resultKey]
    if (resultValue) {
      results.push(...resultValue)
    } else {
      console.warn('Vultr inventory fetch page result extraction failed:', res)
    }
    nextUrl = res.meta.links.next
      ? `${baseUrl}&cursor=${res.meta.links.next}`
      : undefined
  }
  return results
}

export async function GET(_: NextRequest) {
  if (!process.env.VULTR_API_KEY) {
    return Response.json({ 
      data: [], 
      message: "Vultr API key not configured" 
    })
  }
  
  try {
    const rawInventory: VultrProduct[] = []
    const locations: VultrLocation[] = []
    await Promise.all([
      getVultrPaging('https://api.vultr.com/v2/plans', 'plans').then((plans) =>
        rawInventory.push(
          ...plans.map((plan) => {
            return {
              source: 'plans',
              ...plan,
            } as VultrPlanProduct
          })
        )
      ),
      getVultrPaging('https://api.vultr.com/v2/plans-metal', 'plans_metal').then(
        (plans) =>
          rawInventory.push(
            ...plans.map((plan) => {
              return {
                source: 'plansmetal',
                ...plan,
              } as VultrMetalPlanProduct
            })
          )
      ),
      getVultrPaging('https://api.vultr.com/v2/regions', 'regions').then(
        (regions) => locations.push(...regions)
      ),
    ])
    const inventory: HardwareProduct[] = rawInventory.flatMap((product) => {
      return product.locations.map((locationId) => {
        const id = `${product.id}_${locationId}`
        const drives = new Array(product.disk_count).fill({
          capacity: product.disk,
          type: product.source === 'plans' ? undefined : product.type,
        })
        const location = locations.find((l) => l.id === locationId)
        const cpu =
          product.source === 'plans'
            ? {
                cores: product.vcpu_count,
              }
            : {
                cores: product.cpu_count,
                threads: product.cpu_threads,
                name: product.cpu_model,
              }
        return {
          type: product.source === 'plans' ? 'VPS' : 'Bare Metal',
          available: 1_000_000_000, // Unavailable machines have no locations
          cpu: cpu,
          id: id,
          location: location
            ? `${location.city}, ${location.country}`
            : locationId,
          network: {
            max_usage: product.bandwidth,
          },
          price: {
            hourly: parseFloat(
              ((product.monthly_cost * 12) / (365 * 24)).toFixed(3)
            ),
            monthly: product.monthly_cost,
          },
          productName: product.id,
          providerName: 'Vultr',
          ram: {
            capacity: product.ram / 1024,
          },
          storage: drives,
          gpu: product.gpu_vram_gb
            ? [
                {
                  vram: product.gpu_vram_gb,
                  type: product.gpu_type.replaceAll('_', ' '),
                },
              ]
            : [],
        }
      })
    })
    return Response.json(inventory)
  } catch (error) {
    return Response.json({ 
      data: [], 
      message: "Failed to fetch Vultr inventory" 
    })
  }
}

/*
Example

{
  "id": "vc2-1c-0.5gb-free",
  "vcpu_count": 1,
  "ram": 512,
  "disk": 10,
  "disk_count": 1,
  "bandwidth": 0,
  "monthly_cost": 0,
  "type": "vc2",
  "locations": [
    "sea",
    "fra",
    "mia"
  ]
},

{
  "id": "vbm-4c-32gb",
  "physical_cpus": 1,
  "cpu_count": 4,
  "cpu_cores": 4,
  "cpu_threads": 8,
  "cpu_model": "E3-1270",
  "ram": 32768,
  "disk": 240,
  "disk_count": 2,
  "bandwidth": 5120,
  "monthly_cost": 120,
  "monthly_cost_preemptible": 120,
  "type": "SSD",
  "locations": [
    "sjc",
    "sgp"
  ]
},

{
  "id": "ams",
  "city": "Amsterdam",
  "country": "NL",
  "continent": "Europe",
  "options": [
    "ddos_protection",
    "block_storage_storage_opt",
    "block_storage_high_perf",
    "load_balancers",
    "kubernetes"
  ]
}

  */
