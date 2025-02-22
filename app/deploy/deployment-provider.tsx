'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import {
  Check,
  ChevronsUpDown,
  Loader,
  MapPin,
  Search,
  Server,
  X,
} from 'lucide-react'
import { prefix } from 'utils/prefix'

import { type HardwareProduct, type Specs } from '@/types/dataProvider'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import ComboBox from '@/components/ui/combobox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/Icons'

import { Slider } from '../../components/ui/slider'
import { useDeploymentContext } from '../deploy/deployment-context'

const STEP_MIN = 1
const STEP_MAX = 1000
const PRICE_MAX = 10000

type DeploymentProviderProps = {
  specs?: Specs
  onSelect: (selectedProvider: HardwareProduct) => void
}
export default function DeploymentProvider({
  specs,
  onSelect,
}: DeploymentProviderProps) {
  const [searchInput, setSearchInput] = useState<string>('')
  const debouncedSearchInput = useDebounce(searchInput, 500)
  const [region, setRegion] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<
    [number | undefined, number | undefined]
  >([1, PRICE_MAX])
  const debouncedPriceRange = useDebounce(priceRange, 500)
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true)
  const [onlyDedicated, setOnlyDedicated] = useState<boolean>(false)
  const { setConfig, setProvider } = useDeploymentContext()

  const { data: hivelocityData, isFetching: hivelocityFetching } = useQuery({
    queryKey: ['resources', 'Hivelocity'],
    queryFn: () => {
      return fetch(prefix + '/api/hivelocity/inventory')
        .then((res) => res.json())
        .then((res) => res as HardwareProduct[])
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 min
  })
  const { data: vultrData, isFetching: vultrFetching } = useQuery({
    queryKey: ['resources', 'Vultr'],
    queryFn: () => {
      return fetch(prefix + '/api/vultr/inventory')
        .then((res) => res.json())
        .then((res) => res as HardwareProduct[])
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 min
  })

  const rawProviderData = useMemo(
    () => (hivelocityData ?? []).concat(vultrData ?? []),
    [hivelocityData, vultrData]
  )
  const providersLoading = useMemo(
    () => [
      { name: 'Hivelocity', loaded: !hivelocityFetching },
      { name: 'Vultr', loaded: !vultrFetching },
    ],
    [hivelocityFetching, vultrFetching]
  )
  const providersFetching = useMemo(
    () => providersLoading.some((provider) => !provider.loaded),
    [providersLoading]
  )
  const filteredProviderData = useMemo(() => {
    return rawProviderData
      .filter((product) => {
        if (!product.price.monthly) {
          // No price or free is probably not meant to be shown
          return false
        }

        if (
          debouncedSearchInput &&
          !product.productName
            .toLowerCase()
            .includes(debouncedSearchInput.toLowerCase()) &&
          !product.location
            .toLowerCase()
            .includes(debouncedSearchInput.toLowerCase())
        ) {
          return false
        }

        if (region && region.toLowerCase() !== product.location.toLowerCase()) {
          return false
        }

        if (specs?.ram && product.ram.capacity < specs.ram / 1024) {
          return false
        }

        if (
          specs?.storage &&
          product.storage.reduce((prev, cur) => prev + cur.capacity, 0) <
            specs.storage / 1024
        ) {
          return false
        }

        if (
          debouncedPriceRange[0] !== undefined &&
          product.price.monthly < debouncedPriceRange[0]
        ) {
          return false
        }

        if (
          debouncedPriceRange[1] !== undefined &&
          product.price.monthly > debouncedPriceRange[1]
        ) {
          return false
        }

        if (onlyAvailable && product.available === 0) {
          return false
        }

        if (onlyDedicated && product.type === 'VPS') {
          return false
        }

        return true
      })
      .sort((p1, p2) => {
        return p1.price.monthly - p2.price.monthly
      })
      .map((product) => {
        let summary = ''
        if (product.cpu.name) summary += `${product.cpu.name}: `
        if (product.cpu.ghz) summary += `${product.cpu.ghz}GHz `
        if (product.cpu.cores) summary += `${product.cpu.cores}-Core`
        if (product.cpu.threads) summary += ` (${product.cpu.threads} threads)`
        if (product.ram.capacity) summary += `, ${product.ram.capacity}GB RAM`
        if (product.ram.ghz) summary += ` ${product.ram.ghz}GHz`
        if (product.storage.length) {
          summary += `, ${product.storage.reduce((prev, cur) => prev + cur.capacity, 0)} GB Storage (`
          const drives = product.storage
            .map((drive) => {
              let driveDescription = `${drive.capacity} GB`
              if (drive.type) {
                driveDescription += ` ${drive.type}`
              }
              return driveDescription
            })
            .reduce(
              (prev, cur) => {
                prev[cur] = (prev[cur] ?? 0) + 1
                return prev
              },
              {} as { [driveDescription: string]: number }
            )
          Object.keys(drives).forEach((driveDescription, i) => {
            if (i > 0) {
              summary += ', '
            }
            summary += `${drives[driveDescription]}x ${driveDescription}`
          })
          summary += ')'
        }
        if (product.network.speed)
          summary += `, ${product.network.speed} Gbps Networking`
        if (product.network.max_usage)
          summary += `, ${product.network.max_usage} GB Bandwidth`
        if (product.gpu.length) {
          summary += `, ${product.gpu[0].vram}GB VRAM ${product.gpu[0].type ? ` (${product.gpu[0].type})` : ''}`
        }
        return { ...product, summary }
      })
  }, [
    rawProviderData,
    debouncedSearchInput,
    region,
    specs,
    debouncedPriceRange,
    onlyAvailable,
    onlyDedicated,
  ])

  const regionData = useMemo(() => {
    const regionMap = new Map<string, number>()
    rawProviderData.forEach((product) =>
      regionMap.set(
        product.location,
        (regionMap.get(product.location) ?? 0) + 1
      )
    )
    const regionArray = [...regionMap].map(([name, count]) => {
      return { name, count }
    })
    regionArray.sort((r1, r2) => r2.count - r1.count)
    return regionArray.map((r) => r.name)
  }, [rawProviderData])

  const histogramPriceData = useMemo(() => {
    if (!rawProviderData?.length) return []
    const BINS = 32
    const prices = rawProviderData
      .map((provider) => provider.price.monthly)
      .filter((price) => price !== undefined)

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const range = maxPrice - minPrice

    const binSize = range / BINS
    const bins = Array.from({ length: BINS }, (_, i) => minPrice + i * binSize)

    const counts = new Array(BINS).fill(0)
    prices.forEach((price) => {
      const binIndex = Math.min(
        Math.floor((price - minPrice) / binSize),
        BINS - 1
      )
      counts[binIndex]++
    })

    const totalCount = prices.length
    const histogram = counts.map((count, index) => [
      bins[index],
      (count / totalCount) * 100,
    ])
    return histogram
  }, [rawProviderData])

  const scaledHistogramData = useMemo(() => {
    const MIN = 10
    const MAX = 100
    const percentages = histogramPriceData.map(([_, percentage]) => percentage)

    const minPercentage = Math.min(...percentages)
    const maxPercentage = Math.max(...percentages)

    return percentages.map((p) => {
      const normalized = (p - minPercentage) / (maxPercentage - minPercentage)
      return MIN + normalized * (MAX - MIN)
    })
  }, [histogramPriceData])

  const [shownResults, setShownResults] = useState<number>(10)
  useEffect(() => {
    if (shownResults > filteredProviderData.length) {
      return
    }
    // Reduce the initial load time (CPU bottleneck from all product cards)
    const timer = setTimeout(() => setShownResults(shownResults + 100), 100)
    return () => clearTimeout(timer)
  }, [shownResults, setShownResults, filteredProviderData.length])

  const products = useMemo(() => {
    // Cache this (as its significantly large / slow to generate)
    if (!filteredProviderData) {
      return []
    }

    return Object.entries(
      filteredProviderData
        .slice(0, Math.min(shownResults, filteredProviderData.length))
        .reduce(
          (prev, cur) => {
            const id = `${cur.providerName}_${cur.id.split('_')[0]}_${cur.available}_${cur.price.monthly}_${cur.summary}` // Products with the same id are assumed to be the same
            if (!Object.hasOwn(prev, id)) {
              prev[id] = {}
            }

            prev[id][cur.location] = cur
            return prev
          },
          {} as {
            [id: string]: {
              [location: string]: (typeof filteredProviderData)[0]
            }
          }
        )
    ).map(([id, product]) => {
      return (
        <ProductCard
          key={id}
          product={product}
          onSelect={(selectedProduct) => {
            setProvider(selectedProduct)
            setConfig((prev) => ({
              ...prev,
              name: selectedProduct.productName!,
              provider: selectedProduct.providerName!,
              location: selectedProduct.location!,
              isUnit: false,
            }))
            onSelect(selectedProduct)
          }}
        />
      )
    })
  }, [filteredProviderData, shownResults])

  return (
    <div>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg bg-primary/10 transition-all',
          providersFetching ? 'h-3' : 'h-0'
        )}
      >
        <div
          className="absolute left-0 top-0 h-full animate-pulse rounded-full bg-primary transition-all"
          style={{
            width: `${(100 / providersLoading.length) * providersLoading.reduce((prev, cur) => prev + (cur.loaded ? 1 : 0), 0)}%`,
          }}
        />
      </div>
      <div
        className={cn(
          'mt-1 flex items-center gap-1 overflow-hidden transition-all',
          providersFetching ? 'h-auto' : 'h-0'
        )}
      >
        <Loader className="size-3.5 animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Searching{' '}
          {providersLoading.find((provider) => !provider.loaded)?.name}...
        </p>
      </div>
      <div className="mt-8 flex gap-12">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            disabled={
              region === null &&
              searchInput === '' &&
              priceRange[0] === undefined &&
              priceRange[1] === undefined
            }
            size="lg"
            variant="outline"
            onClick={() => {
              setPriceRange([undefined, undefined])
              setRegion(null)
              setSearchInput('')
            }}
            className="gap-1.5"
          >
            <X className="size-4 shrink-0" />
            Reset filter
          </Button>
          <Separator className="my-3" />
          <div className="flex flex-col space-y-2">
            <Label htmlFor="search">Search providers and servers</Label>
            <div className="relative flex w-full max-w-80 items-center">
              <Search className="absolute left-3 size-4" />
              <Input
                id="search"
                type="text"
                placeholder="Providers and servers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Separator className="my-3" />
          <div>
            <Label>Price Range</Label>
            <div className="mt-2 flex h-16 w-full items-end gap-px">
              {scaledHistogramData.map((percentage, index) => (
                <div
                  key={`histogram-bin-${index}`}
                  className="flex-1 rounded-t-[3px] bg-border"
                  style={{ height: `${percentage}%` }}
                />
              ))}
            </div>
            <Slider
              minStepsBetweenThumbs={2}
              max={STEP_MAX}
              min={STEP_MIN}
              step={10}
              onValueChange={(values: [number, number]) =>
                setPriceRange(values)
              }
              className="w-full"
              value={[priceRange[0] ?? STEP_MIN, priceRange[1] ?? STEP_MAX]}
            />
            <div className="mt-3 flex w-full items-center justify-between gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 mt-px inline-flex items-center text-sm font-medium leading-10 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={priceRange[0] ?? ''}
                  placeholder={STEP_MIN.toString()}
                  min={STEP_MIN}
                  onChange={(e) => {
                    const inputVal = e.target.value
                    let newVal: number | undefined
                    if (inputVal !== '' && !isNaN(Number(inputVal))) {
                      newVal = Number(inputVal)
                    }
                    setPriceRange([newVal, priceRange[1]])
                  }}
                  onBlur={(e) => {
                    const inputVal = e.target.value
                    if (inputVal === '') return
                    const newValue = +inputVal
                    if (newValue < STEP_MIN) {
                      setPriceRange([STEP_MIN, priceRange[1]])
                    }
                    if (newValue >= (priceRange?.[1] ?? PRICE_MAX)) {
                      setPriceRange([
                        Math.max((priceRange?.[1] ?? PRICE_MAX) - 20, 0),
                        priceRange[1],
                      ])
                    }
                  }}
                  className="h-8 w-[5.125rem] pl-6"
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 mt-px inline-flex items-center text-sm font-medium leading-10 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={priceRange[1] ?? ''}
                  placeholder={STEP_MAX.toString()}
                  onChange={(e) => {
                    const inputVal = e.target.value
                    let newVal: number | undefined
                    if (inputVal !== '' && !isNaN(+inputVal)) {
                      newVal = +inputVal
                    }
                    setPriceRange([priceRange[0], newVal])
                  }}
                  onBlur={(e) => {
                    const inputVal = e.target.value
                    if (inputVal === '') return
                    if (+inputVal < STEP_MIN) {
                      setPriceRange([priceRange[0], STEP_MIN])
                    }
                    if (+inputVal > PRICE_MAX) {
                      setPriceRange([priceRange[0], PRICE_MAX])
                    }
                  }}
                  className="h-8 w-[5.125rem] pl-6"
                />
              </div>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex flex-col space-y-2">
            <Label htmlFor="region">Region</Label>
            <Popover>
              <PopoverTrigger id="region" asChild disabled={providersFetching}>
                <Button
                  size="lg"
                  variant="outline"
                  role="combobox"
                  className="min-w-64 justify-between"
                >
                  <span className="max-w-[20ch] truncate">
                    {region ? region : 'Select region...'}
                  </span>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder="Search regions..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No regions found</CommandEmpty>
                    <CommandGroup>
                      {regionData?.map((regionItem) => {
                        const selected = regionItem === region
                        return (
                          <CommandItem
                            key={`region-${regionItem}`}
                            onSelect={() => {
                              selected ? setRegion(null) : setRegion(regionItem)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-1.5 size-4 shrink-0 transition-transform',
                                selected ? 'scale-100' : 'scale-0'
                              )}
                            />
                            {regionItem}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator className="my-3" />
          <div className="flex place-items-center gap-2">
            <Checkbox
              id="onlyAvailable"
              checked={onlyAvailable}
              onCheckedChange={(e) => {
                if (e !== 'indeterminate') {
                  setOnlyAvailable(e)
                }
              }}
            />
            <Label htmlFor="onlyAvailable">Only Available</Label>
          </div>
          <div className="invisible flex place-items-center gap-2">
            <Checkbox
              id="onlyDedicated"
              checked={onlyDedicated}
              onCheckedChange={(e) => {
                if (e !== 'indeterminate') {
                  setOnlyDedicated(e)
                }
              }}
            />
            <Label htmlFor="onlyDedicated">Dedicated Hardware Only</Label>
          </div>
        </div>
        <ScrollArea className="h-[40rem] w-full flex-1 pr-3" type="auto">
          <ul className="flex flex-col gap-2 text-black">
            <li className="grid grid-cols-12 items-center gap-12 rounded border border-primary bg-gradient-to-r from-primary/5 to-[#FFFED9] px-6 py-4">
              <div className="col-span-7 flex items-center gap-4">
                <Icons.Openmesh className="size-14 p-1" />
                <div>
                  <div className="flex items-start gap-1">
                    <p className="text-lg font-bold">Openmesh Cloud</p>
                    <span className="rounded bg-primary px-1.5 py-px text-xs font-medium text-background">
                      Beta
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Peer to Peer Resource Marketplace
                  </p>
                </div>
              </div>
              <div className="col-span-2"></div>
              <div className="col-span-3 flex flex-1 justify-end">
                <div className="flex flex-col items-center gap-2">
                  <Button disabled size="lg" className="min-w-48">
                    Coming Soon
                  </Button>
                  <p className="text-sm text-primary">1,000 OPEN Rewards</p>
                </div>
              </div>
            </li>
            <li className="grid grid-cols-12 items-center gap-12 rounded border border-primary/25 bg-primary/[0.01] px-6 py-4">
              <div className="col-span-7 flex items-center gap-4">
                <Image
                  src={`${prefix}/images/xnode-card/silvercard-front.webp`}
                  alt="Xnode Card"
                  width={56}
                  height={40}
                  className="rounded object-contain"
                />
                <div>
                  <p className="text-lg font-bold">Xnode DVM</p>
                  <p className="text-sm text-muted-foreground">
                    8-Core, 16GB RAM, 320 GB Storage (1x 320 GB), 1 Gbps
                    Networking, 10000 GB Bandwidth
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="font-medium line-through">
                  ~$260<span>/mo</span>
                </p>
                <p className="text-xl font-bold text-green-600">Free</p>
              </div>
              <div className="col-span-3 flex flex-1 justify-end">
                <div className="flex flex-col items-center gap-2">
                  <Link href="/claim">
                    <Button
                      size="lg"
                      className="min-w-48"
                      variant="outlinePrimary"
                    >
                      Select
                    </Button>
                  </Link>
                </div>
              </div>
            </li>
          </ul>
          <ul className="mt-8 flex flex-col gap-2 text-black">
            {products.length === 0 ? (
              <li className="my-12 grid place-content-center text-xl font-bold">
                No results found.
              </li>
            ) : (
              products
            )}
          </ul>
        </ScrollArea>
      </div>
    </div>
  )
}

function ProductCard({
  key,
  product,
  onSelect,
}: {
  key: any
  product: {
    [location: string]: HardwareProduct & {
      summary: string
    }
  }
  onSelect: (product: HardwareProduct) => void
}) {
  const locations = useMemo(() => Object.keys(product), [product])
  const [location, setLocation] = useState<string>(locations.at(0))
  const selectedProduct = useMemo(() => product[location], [product, location])

  return (
    <li key={key} className="flex flex-col gap-4 rounded border px-6 py-4">
      <div className="grid grid-cols-12 items-center gap-12">
        <div className="col-span-5 flex items-center gap-4">
          <Image
            src={`${prefix}/images/providers/${selectedProduct.providerName.toLowerCase()}.svg`}
            alt={selectedProduct.providerName + ' logo'}
            width={48}
            height={48}
            className="text-xs"
          />
          <div>
            <p className="font-bold">{selectedProduct.productName}</p>
            <p className="text-sm text-muted-foreground">
              {selectedProduct.summary}
            </p>
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <ComboBox
              className="size-auto p-1"
              data={locations}
              selectedItem={location}
              setItemSelect={setLocation}
            />
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Server className="size-3.5" />
            <p className="text-sm">{selectedProduct.providerName}</p>
          </div>
        </div>
        <div className="col-span-2">
          <p>
            ~
            <span className={'text-xl font-bold'}>
              {formatPrice(selectedProduct.price.monthly ?? 0)}
            </span>
            /mo
            {selectedProduct.price.hourly !== undefined && (
              <div className="pl-1">
                (
                <span className="font-bold">
                  {formatPrice(selectedProduct.price.hourly)}
                </span>
                /hr)
              </div>
            )}
          </p>
        </div>
        <div className="col-span-3 flex flex-1 justify-end">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant={'outlinePrimary'}
              size="lg"
              className="min-w-48"
              onClick={() => {
                onSelect({ ...selectedProduct, location })
              }}
              disabled={
                selectedProduct.available === 0 ||
                selectedProduct.storage.length > 1 ||
                (selectedProduct.providerName === 'Hivelocity' &&
                  selectedProduct.type === 'Bare Metal')
              }
            >
              Select
            </Button>
            {selectedProduct.available === 0 && (
              <p className="text-sm text-muted-foreground">Unavailable</p>
            )}
            {selectedProduct.available > 0 &&
              (selectedProduct.storage.length > 1 ||
                (selectedProduct.providerName === 'Hivelocity' &&
                  selectedProduct.type === 'Bare Metal')) && (
                <p className="text-sm text-muted-foreground">Unsupported</p>
              )}
          </div>
        </div>
      </div>
    </li>
  )
}