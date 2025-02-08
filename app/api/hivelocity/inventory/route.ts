import { NextRequest } from 'next/server'

import type { HardwareProduct } from '@/types/dataProvider'

interface HivelocityProduct {
  annually_location_premium: number
  biennial_location_premium: number
  core: boolean
  data_center: string
  edge: boolean
  hourly_location_premium: number
  is_sps: boolean
  is_vps: boolean
  location_option_id: number
  monthly_location_premium: number
  processor_info: {
    cores: number
    sockets: number
    threads: number
    vcpus: number
  }
  product_annually_price: number
  product_bandwidth: string
  product_biennial_price: number
  product_cpu: string
  product_cpu_cores: string
  product_defaults: {
    [id: string]: number
  }
  product_disabled_billing_periods: string[]
  product_display_price: null
  product_drive: string
  product_gpu: string | 'None'
  product_hourly_price: number
  product_id: number
  product_memory: string
  product_monthly_price: number
  product_name: string
  product_on_sale: boolean
  product_original_price: number
  product_quarterly_price: number
  product_semi_annually_price: number
  product_triennial_price: number
  quarterly_location_premium: number
  semi_annually_location_premium: number
  stock: 'unavailable' | 'available' | 'limited'
  triennial_location_premium: number
}

interface HivelocityLocation {
  location_option_ids: number[]
  edge: boolean
  location: { state: string; city: string; country: string }
  code: string
  title: string
  core: boolean
  id: number
}

function extractNumberBeforePostfix({
  data,
  postfix,
  isInt,
}: {
  data: string
  postfix: string
  isInt: boolean
}): number | undefined {
  if (!data.includes(postfix)) {
    return undefined
  }

  const numberString = data.split(postfix)[0].split(' ').at(-1)
  if (!numberString) {
    return undefined
  }

  const res = isInt ? parseInt(numberString) : parseFloat(numberString)
  if (isNaN(res)) {
    return undefined
  }

  return res
}

export async function GET(_: NextRequest) {
  if (!process.env.HIVELOCITY_API_KEY) {
    return Response.json({ 
      data: [], 
      message: "Hivelocity API key not configured" 
    })
  }

  try {
    const rawInventory: HivelocityProduct[] = []
    const locations: HivelocityLocation[] = []
    await Promise.all(
      ['MAIN', 'GPU', 'OUTLET', 'LANDING']
        .map(async (location) => {
          rawInventory.push(
            ...(await fetch(
              `https://core.hivelocity.net/api/v2/inventory/product?location=${location}&bonding_support=null&group_by=flat`,
              {
                headers: [
                  ['Accept', 'application/json'],
                  ['X-API-KEY', process.env.HIVELOCITY_API_KEY],
                ],
              }
            ).then((res) => res.json()))
          )
        })
        .concat([
          fetch('https://core.hivelocity.net/api/v2/inventory/locations')
            .then((res) => res.json())
            .then((data) => {
              locations.push(...data)
            }),
        ])
    )
    const inventory: HardwareProduct[] = rawInventory.map((product) => {
      const id = `${product.product_id.toString()}_${product.data_center}`
      const drives = product.product_drive.split(', ').flatMap((drive) => {
        const amountOfDrives = extractNumberBeforePostfix({
          data: drive.toLowerCase(),
          postfix: ' x',
          isInt: true,
        })
        let storageCapacity = extractNumberBeforePostfix({
          data: drive.toLowerCase(),
          postfix: 'gb',
          isInt: true,
        })
        if (storageCapacity === undefined) {
          storageCapacity = extractNumberBeforePostfix({
            data: drive.toLowerCase(),
            postfix: 'tb',
            isInt: false,
          })
          if (!isNaN(storageCapacity)) {
            storageCapacity *= 1000
          }
        }
        const storageType = drive.toLowerCase().includes('nvme')
          ? 'NVMe'
          : drive.toLowerCase().includes('ssd')
            ? 'SSD'
            : drive.toLowerCase().includes('sata')
              ? 'SATA'
              : undefined
        return new Array(amountOfDrives === undefined ? 1 : amountOfDrives).fill({
          capacity: storageCapacity,
          type: storageType,
        })
      })
      const location = locations.find((l) => l.code === product.data_center)
      let networkMaxUsage = extractNumberBeforePostfix({
        data: product.product_bandwidth.split(' / ')[0].toLowerCase(),
        postfix: 'gb',
        isInt: true,
      })
      if (isNaN(networkMaxUsage)) {
        networkMaxUsage = extractNumberBeforePostfix({
          data: product.product_bandwidth.split(' / ')[0].toLowerCase(),
          postfix: 'tb',
          isInt: false,
        })
        if (!isNaN(networkMaxUsage)) {
          networkMaxUsage *= 1000
        }
      }
      return {
        type: product.is_vps ? 'VPS' : 'Bare Metal',
        available:
          /*product.stock === 'limited'
            ? 1_000
            :*/ product.stock === 'available' ? 1_000_000_000 : 0,
        cpu: {
          cores: product.processor_info.cores,
          threads: product.processor_info.threads,
          ghz: extractNumberBeforePostfix({
            data: product.product_cpu.toLowerCase(),
            postfix: 'ghz',
            isInt: false,
          }),
          name: product.is_vps
            ? undefined
            : product.product_cpu.replace('2x ', '').split(' ')[0],
        },
        id: id,
        location: location
          ? `${location.location.city}, ${location.location.country}`
          : product.data_center,
        network: {
          speed: extractNumberBeforePostfix({
            data: product.product_bandwidth.toLowerCase(),
            postfix: 'gbps',
            isInt: true,
          }),
          max_usage: networkMaxUsage,
        },
        price: {
          hourly: product.product_disabled_billing_periods.includes('hourly')
            ? undefined
            : product.product_hourly_price + product.hourly_location_premium,
          monthly: product.product_disabled_billing_periods.includes('monthly')
            ? undefined
            : product.product_monthly_price + product.monthly_location_premium,
          quarterly: product.product_disabled_billing_periods.includes(
            'quarterly'
          )
            ? undefined
            : (product.product_quarterly_price +
                product.quarterly_location_premium) *
              3,
          // semi_annually: product.product_disabled_billing_periods.includes(
          //   'semi_annually'
          // )
          //   ? undefined
          //   : (product.product_semi_annually_price +
          //       product.semi_annually_location_premium) *
          //     6,
          yearly: product.product_disabled_billing_periods.includes('annually')
            ? undefined
            : (product.product_annually_price +
                product.annually_location_premium) *
              12,
          // biennial: product.product_disabled_billing_periods.includes('biennial')
          //   ? undefined
          //   : (product.product_biennial_price +
          //       product.biennial_location_premium) *
          //     24,
        },
        productName: product.product_name || id,
        providerName: 'Hivelocity',
        ram: {
          capacity: extractNumberBeforePostfix({
            data: product.product_memory.toLowerCase(),
            postfix: 'gb',
            isInt: true,
          }),
        },
        storage: drives,
        gpu: [],
      }
    })
    return Response.json(inventory)
  } catch (error) {
    return Response.json({ 
      data: [], 
      message: "Failed to fetch Hivelocity inventory" 
    })
  }
}

/*
Example

{
  annually_location_premium: 0,
  biennial_location_premium: 0,
  core: true,
  data_center: 'AMS1',
  edge: false,
  hourly_location_premium: 0,
  is_sps: true,
  is_vps: false,
  location_option_id: 144406,
  monthly_location_premium: 0,
  processor_info: { cores: 6, sockets: 1, threads: 12, vcpus: 72 },
  product_annually_price: 68,
  product_bandwidth: '20TB / 1Gbps',
  product_biennial_price: 68,
  product_cpu: 'E-2136 3.3GHz Coffee Lake',
  product_cpu_cores: '<br/>(6 cores/12 threads)',
  product_defaults: {
    '11128': 144206,
    '11130': 142850,
    '11137': 144534,
    '11138': 143117,
    '11139': 142977,
    '11140': 143119,
    '11141': 143120,
    '11144': 143004,
    '11149': 144184,
    '11150': 143129,
    '11151': 143130,
    '11152': 144187,
    '11153': 144186,
    '11164': 143158,
    '11191': 144189,
    '11195': 144319,
    '11198': 144697
  },
  product_disabled_billing_periods: [ 'biennial', 'triennial' ],
  product_display_price: null,
  product_drive: '960GB SSD',
  product_gpu: 'None',
  product_hourly_price: 0.14,
  product_id: 474,
  product_memory: '16GB',
  product_monthly_price: 68,
  product_name: 'ci.nano.s2',
  product_on_sale: true,
  product_original_price: 119,
  product_quarterly_price: 68,
  product_semi_annually_price: 68,
  product_triennial_price: 68,
  quarterly_location_premium: 0,
  semi_annually_location_premium: 0,
  stock: 'unavailable',
  triennial_location_premium: 0
}

{
  "location_option_ids": [
    144188, 145225, 145241, 148980, 149033, 149106, 149123, 149176, 149193,
    149308, 149402, 149434, 142632, 144198
  ],
  "edge": false,
  "location": { "state": "FL", "city": "Tampa", "country": "US" },
  "code": "TPA1",
  "title": "Tampa 1",
  "core": true,
  "id": 3
}
  */
