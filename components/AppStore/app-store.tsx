'use client'

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from 'react'

import 'react-toastify/dist/ReactToastify.css'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { prefix } from '@/utils/prefix'
import { AppWindow, X } from 'lucide-react'
import ServiceDefinitions from 'utils/service-definitions.json'
import TemplateDefinitions from 'utils/template-definitions.json'

import {
  type AppStoreItem,
  type AppStorePageType,
  type ServiceData,
  type Specs,
} from '@/types/dataProvider'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useDemoModeContext } from '../demo-mode'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Temporary fix for build - will be used in future
const useCases: AppStoreItem[] = []

export const optionsNetwork = [
  {
    name: 'Date Created',
    value: 'Date Created',
  },
  {
    name: 'Template Name',
    value: 'Template Name',
  },
]

export const optionsCreator = [
  {
    name: 'Openmesh',
    value: 'Openmesh',
  },
]

export const providerNameToLogo = {
  Equinix: {
    src: 'new-equinix.png',
    width: 'w-[50px]',
  },
}

type AppStoreProps = {
  nftId?: string
  categories: string[]
  type: AppStorePageType
}

export default function AppStore({ nftId, categories, type }: AppStoreProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [optimisticCategories, setOptimisticCategories] = useOptimistic(
    categories,
    (state, newCategories: string[]) => newCategories
  )

  const handleCategoryChange = useCallback(
    (newCategories: string[]) => {
      setOptimisticCategories(newCategories)
      startTransition(() => {
        const params = new URLSearchParams(searchParams)
        params.delete('category')
        newCategories.forEach((category) => params.append('category', category))
        router.push(`/app-store?${params.toString()}`)
      })
    },
    [router, searchParams, setOptimisticCategories]
  )

  const handleCategoryRemove = useCallback(
    (category: string) => {
      const newCategories = optimisticCategories.filter((c) => c !== category)
      handleCategoryChange(newCategories)
    },
    [handleCategoryChange, optimisticCategories]
  )

  const data = useMemo(() => {
    if (type === 'templates') return TemplateDefinitions
    if (type === 'use-cases') return useCases
    let filteredData: AppStoreItem[] = []
    if (!optimisticCategories.length) return data
    for (const dataItem of data) {
      if (
        dataItem.tags &&
        optimisticCategories.every((category) => dataItem.tags.includes(category))
      ) {
        filteredData.push(dataItem)
      }
    }
    return filteredData
  }, [optimisticCategories, type])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            App Store
          </Link>
          <span>/</span>
          <span className="text-foreground">Browse</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <Link
            key={item.id}
            href={`/deploy?id=${item.id}&type=${type}`}
            className="flex flex-col rounded-lg border p-4 hover:bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AppWindow
                  className="size-8 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-semibold">{item.name}</h3>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            {item.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-primary/5 px-2 py-0.5 text-xs text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
