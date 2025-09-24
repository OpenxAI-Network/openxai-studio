'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import AgentDefinitions from '@/utils/agent-definitions.json'
import ModelDefinitions from '@/utils/model-definitions.json'
import { prefix } from '@/utils/prefix'
import { AppWindow, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeploymentCounter } from '@/app/deploy/deloyment-counter'

import { SimpleTooltip } from '../Common/SimpleTooltip'
import { SortDropdown } from './ai-model-dropdown'

interface ModelOption {
  name: string
  desc: string
  nixName: string
  type: string
  requirements: {
    [key: string]: {
      ram: number
      storage: number
      cpu: number
      ollamaCommand: string
    }
  }
}

type ModelData = {
  id: string
  name: string
  model_sizes?: string
  type: string
  desc: string
  last_updated?: string
  logo: string
  nixName: string
}

const sortOptions = [
  { value: 'most-popular', label: 'Most Popular' },
  { value: 'recently-updated', label: 'Recently Updated' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
]

const modelTypes = ['General', 'Vision', 'Embedding', 'Code']
const agentTypes = ['Agent']

function parseRelativeTime(timeString: string): number {
  const [amount, unit] = timeString.split(' ')
  const now = Date.now()
  const number = parseInt(amount)

  switch (unit) {
    case 'days':
    case 'day':
      return now - number * 24 * 60 * 60 * 1000
    case 'weeks':
    case 'week':
      return now - number * 7 * 24 * 60 * 60 * 1000
    case 'months':
    case 'month':
      return now - number * 30 * 24 * 60 * 60 * 1000
    default:
      return now
  }
}

function ModelCard({ data }: { data: ModelData }) {
  const sizes = data.model_sizes?.split(',') || ['7b']
  const iconPath = data.logo

  const cardContent = (
    <div
      className={cn(
        'flex h-[200px] cursor-pointer flex-col rounded-lg border p-4 hover:bg-muted/50'
      )}
    >
      <div className="mb-1 flex items-start gap-4">
        <img
          src={iconPath}
          alt={data.name}
          className="-ml-2 size-12 object-contain"
        />
        <div className="flex flex-col">
          <div className="flex gap-2">
            <h3 className="text-[13px] font-semibold xl:text-[16px] 2xl:text-lg">
              {data.name}
            </h3>
            <SimpleTooltip tooltip="Total deployment count">
              <DeploymentCounter app={data.name} />
            </SimpleTooltip>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground xl:text-[12px] 2xl:text-[13px]">
            {data.desc}
          </p>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground xl:text-[13px]">
          <SimpleTooltip tooltip="Last updated">
            <span>{data.last_updated}</span>
          </SimpleTooltip>
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex max-h-[80px] flex-wrap gap-2 overflow-y-auto">
          {sizes.map((size) => (
            <span
              key={size}
              className="whitespace-nowrap rounded bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700 xl:text-xs"
            >
              {size.trim()}
            </span>
          ))}
        </div>
        <span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700 xl:text-xs">
          {data.type}
        </span>
      </div>
    </div>
  )

  return (
    <Link
      href={
        data.type === 'Agent'
          ? `/deploy?agentId=${data.nixName}`
          : `/deploy?templateId=${data.nixName}`
      }
    >
      {cardContent}
    </Link>
  )
}

export default function AppDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recently-updated')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('models')

  const initialModels = ModelDefinitions.map((model) => ({
    ...model,
    model_sizes: Object.keys(
      (model.options?.[0] as ModelOption)?.requirements || {}
    ).join(','),
    type: model.tags[0] || 'General',
  }))

  const filteredAndSortedItems = useMemo(() => {
    let items =
      activeTab === 'models' ? [...initialModels] : [...AgentDefinitions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter((item) => item.name.toLowerCase().includes(query))
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      items = items.filter((item) => selectedTypes.includes(item.type))
    }

    // Apply sorting
    switch (sortBy) {
      case 'most-popular':
        items.sort(
          (a, b) =>
            (b.model_sizes?.split(',').length || 0) -
            (a.model_sizes?.split(',').length || 0)
        )
        break
      case 'recently-updated':
        items.sort((a, b) => {
          const dateA = parseRelativeTime(a.last_updated || '')
          const dateB = parseRelativeTime(b.last_updated || '')
          return dateB - dateA
        })
        break
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        items.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return items
  }, [initialModels, sortBy, selectedTypes, searchQuery, activeTab])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSelectedTypes([]) // Reset type filters when switching tabs
  }

  const typeOptions = activeTab === 'models' ? modelTypes : agentTypes

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            App Store
          </Link>
          <span>/</span>
          <span className="text-foreground">App Directory</span>
        </div>

        {/* Search and Filters Container */}
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative w-full lg:w-[300px]">
            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Type Filter Tags */}
          <div className="flex flex-wrap justify-center gap-2 lg:flex-1">
            {typeOptions.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className={cn(
                  'transition-colors',
                  selectedTypes.includes(type) &&
                    'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                onClick={() => toggleType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex justify-end">
            <SortDropdown
              value={sortBy}
              onValueChange={setSortBy}
              options={sortOptions}
            />
          </div>
        </div>
      </div>

      {/* Tab navigation for Models vs Agents */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedItems.map((item) => (
          <ModelCard key={item.id} data={item} />
        ))}
      </div>
    </div>
  )
}
