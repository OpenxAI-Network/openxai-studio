'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import ModelDefinitions from '@/utils/model-definitions.json'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowRight, Earth, Triangle } from 'lucide-react'
import {
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts'

import { ChartContainer } from '@/components/ui/chart'

export default function Home() {
  const { data: activeDeployments } = useQuery({
    queryKey: ['activeDeployments'],
    queryFn: async () => {
      return axios
        .get('https://indexer.core.openxai.org/api/ownaiv1/base/active')
        .then((res) => res.data as number)
    },
  })
  const { data: deploymentStock } = useQuery({
    queryKey: ['deploymentStock'],
    queryFn: async () => {
      return axios
        .get('https://indexer.core.openxai.org/api/ownaiv1/base/available')
        .then((res) => res.data as number)
    },
  })
  const { data: totalDeployments } = useQuery({
    queryKey: ['totalDeployments'],
    queryFn: async () => {
      return axios
        .get('https://indexer.core.openxai.org/api/deployment_signature/total')
        .then((res) => res.data as number)
    },
  })
  const { data: dailyDeployments } = useQuery({
    queryKey: ['dailyDeployments'],
    queryFn: async () => {
      return axios
        .get(
          'https://indexer.core.openxai.org/api/deployment_signature/per_day'
        )
        .then((res) => res.data as { count: number; day: number }[])
    },
  })

  const networkCapacity = useMemo(() => {
    if (activeDeployments === undefined || deploymentStock === undefined) {
      return undefined
    }

    return activeDeployments + deploymentStock
  }, [activeDeployments, deploymentStock])

  const networkCapacityPercentage = useMemo(() => {
    if (activeDeployments === undefined || networkCapacity === undefined) {
      return undefined
    }

    return (100 * activeDeployments) / networkCapacity
  }, [activeDeployments, networkCapacity])

  const maxDailyDeploymentCount = useMemo(() => {
    if (!dailyDeployments) {
      return 1
    }

    return Math.max(...dailyDeployments.map((deployment) => deployment.count))
  }, [dailyDeployments])

  const monthlyDeploymentCount = useMemo(() => {
    if (!dailyDeployments) {
      return undefined
    }

    return dailyDeployments
      .filter(
        (deployment) => Math.round(Date.now() / 86400_000) - deployment.day < 30
      )
      .reduce((prev, cur) => prev + cur.count, 0)
  }, [dailyDeployments])

  const lastMonthDeploymentCount = useMemo(() => {
    if (!dailyDeployments) {
      return undefined
    }

    return dailyDeployments
      .filter((deployment) => {
        const daysAgo = Math.round(Date.now() / 86400_000) - deployment.day
        return daysAgo >= 30 && daysAgo < 60
      })
      .reduce((prev, cur) => prev + cur.count, 0)
  }, [dailyDeployments])

  const monthlyDeploymentGrowth = useMemo(() => {
    if (monthlyDeploymentCount === undefined || !lastMonthDeploymentCount) {
      return undefined
    }

    return (100 * monthlyDeploymentCount) / lastMonthDeploymentCount - 100
  }, [monthlyDeploymentCount, lastMonthDeploymentCount])

  return (
    <div className="flex size-full">
      <div className="flex flex-1 basis-1/2 flex-col gap-32 max-xl:basis-2/3 max-xl:gap-20">
        <div className="mt-24 px-16">
          <h1 className="text-balance text-5xl font-semibold 2xl:text-7xl">
            Build and deploy AI agents in 5 minutes
          </h1>
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/app-store"
              className="flex h-14 items-center rounded-3xl bg-primary px-12 text-xl font-medium text-background transition-colors hover:bg-primary/90 max-xl:h-10 max-xl:px-6"
            >
              Build Now
            </Link>
            <Link
              href="https://docs.openxai.org"
              target="_blank"
              className="flex h-14 place-items-center items-center gap-2 rounded px-2 font-medium text-blue-600 transition-colors hover:bg-foreground/10 max-xl:h-10"
            >
              <span>Quick guide</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-4">
          <div className="flex place-content-center border-r border-gray-400 py-1">
            <div className="flex flex-col place-items-center">
              <div className="flex place-content-start">
                <span className="text-4xl font-medium max-xl:text-3xl">
                  {totalDeployments ?? '...'}
                </span>
              </div>
              <span className="text-xs">Total Deployments</span>
            </div>
          </div>
          <div className="flex place-content-center border-r border-gray-400 py-1">
            <div className="flex flex-col place-items-center">
              <div className="flex place-content-start">
                <span className="text-4xl font-medium max-xl:text-3xl">
                  {ModelDefinitions.length}
                </span>
              </div>
              <span className="text-xs">Apps</span>
            </div>
          </div>
          <div className="flex place-content-center border-r border-gray-400 py-1">
            <div className="flex flex-col place-items-center">
              <div className="flex place-content-start">
                <span className="text-4xl font-medium max-xl:text-3xl">
                  {'>'}50
                </span>
                <span>K</span>
              </div>
              <span className="text-xs">Transaction /s</span>
            </div>
          </div>
          <div className="flex place-content-center py-1">
            <div className="flex flex-col place-items-center">
              <div className="flex place-content-start">
                <span className="text-4xl font-medium max-xl:text-3xl">
                  600
                </span>
                <span>ms</span>
              </div>
              <span className="text-xs">Time to Finality (avg)</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 mb-6">
          <div className="flex place-content-center border-r border-gray-400">
            <div className="flex place-items-center gap-3">
              <div>
                <ChartContainer
                  config={{
                    data: {
                      color: 'hsl(var(--primary))',
                    },
                  }}
                  className="size-[90px]"
                >
                  <RadialBarChart
                    accessibilityLayer
                    data={[
                      {
                        data: networkCapacityPercentage ?? 0,
                        fill: 'hsl(var(--primary))',
                      },
                    ]}
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={45}
                    outerRadius={35}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <PolarGrid
                      gridType="circle"
                      radialLines={false}
                      stroke="none"
                      className="first:fill-[#EBF2FF] last:fill-[#FFFFFF]"
                      polarRadius={[42, 38]}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <RadialBar dataKey="data" cornerRadius={2} />
                    <PolarRadiusAxis
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground font-mono text-2xl font-bold"
                                >
                                  {networkCapacityPercentage
                                    ? networkCapacityPercentage.toFixed(0)
                                    : '..'}
                                  %
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </PolarRadiusAxis>
                  </RadialBarChart>
                </ChartContainer>
              </div>
              <div className="flex flex-col place-content-center">
                <span className="text-2xl font-semibold">
                  {networkCapacity
                    ? networkCapacity.toLocaleString('en-US')
                    : '...'}
                </span>
                <span className="text-sm text-muted-foreground">
                  Network Capacity
                </span>
              </div>
            </div>
          </div>
          <div className="flex place-content-center">
            <div className="flex place-items-center gap-3">
              <div className="grid size-20 grid-cols-3 gap-0.5 max-xl:size-16">
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = Math.round(Date.now() / 86400_000) - 29 + i
                  const deploymentCount =
                    dailyDeployments?.find(
                      (deployment) => deployment.day === day
                    )?.count ?? 0
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: `hsla(219, 100%, 50%, ${(0.05 + 0.95 * (deploymentCount / maxDailyDeploymentCount)).toFixed(2)})`,
                      }}
                    />
                  )
                })}
              </div>
              <div className="flex flex-col place-content-center">
                <div className="flex place-items-center gap-4 text-2xl">
                  <span className="font-semibold">
                    {monthlyDeploymentCount ?? '...'}
                  </span>
                  {monthlyDeploymentGrowth > 0 && (
                    <div className="flex place-items-center gap-1 text-green-600">
                      <Triangle className="size-4 fill-green-600" />
                      <span>+{monthlyDeploymentGrowth.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  30 Days Deployments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-1 basis-1/2 place-content-center place-items-center max-xl:basis-1/2">
        <Earth className="size-full" />
      </div>
    </div>
  )
}

