'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import ModelDefinitions from '@/utils/model-definitions.json'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowRight, Triangle } from 'lucide-react'
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

    if (networkCapacity === 0) {
      return 0
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
      <div className="flex flex-1 basis-1/2 flex-col pl-16 max-xl:basis-2/3">
        <div className="mt-16">
          <h1
            className="text-balance pr-0 text-5xl font-semibold 2xl:text-7xl"
            style={{ lineHeight: '1.2' }}
          >
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
        <div className="my-14 grid w-full grid-cols-2 gap-4 py-4 md:w-full md:grid-cols-4 lg:gap-0 lg:py-0 xl:my-20 3xl:w-[80%]">
          <div className="flex w-[90%] items-start justify-start border-r border-gray-400 py-2 pr-0 lg:pr-0 xl:pr-0">
            <div className="flex flex-col">
              <div className="flex justify-center">
                <span className="text-xl font-medium lg:text-xl xl:text-3xl 3xl:text-4xl">
                  {' '}
                  {totalDeployments ?? '...'}
                </span>
              </div>
              <span className="text-[10px] font-medium xl:text-[12px]">
                Total Deployments
              </span>
            </div>
          </div>
          <div className="-ml-1 flex justify-center border-r border-gray-400 px-4 py-2 lg:px-2 xl:px-4">
            <div className="flex flex-col">
              <div className="flex justify-center">
                <span className="text-xl font-medium lg:text-xl xl:text-3xl 3xl:text-4xl">
                  {' '}
                  {ModelDefinitions.length}
                </span>
              </div>
              <span className="text-center text-[10px] font-medium xl:text-[12px]">
                Apps
              </span>
            </div>
          </div>
          <div className="flex w-full justify-center border-r border-gray-400 px-5 py-2 lg:px-2 xl:px-5">
            <div className="flex flex-col">
              <div className="flex">
                <span className="text-xl font-medium lg:text-xl xl:text-3xl 3xl:text-4xl">
                  {'<'}10
                </span>
                <span className="text-sm lg:text-[12px]">min</span>
              </div>
              <span className="text-[10px] font-medium xl:text-[12px]">
                Deployment
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center px-5 py-2 lg:px-2 xl:px-5">
            <div className="flex flex-col">
              <div className="flex justify-center">
                <span className="text-xl font-medium lg:text-xl xl:text-3xl 3xl:text-4xl">
                  80
                </span>
                <span className="text-sm lg:text-[12px]">%</span>
              </div>
              <span className="text-center text-[10px] font-medium xl:text-[12px]">
                Cheaper (up to)
              </span>
            </div>
          </div>
        </div>
        <div className="mb-14 grid w-full grid-cols-2 2xl:w-[90%]">
          <div className="flex items-start justify-start border-r border-gray-400">
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
                                  {networkCapacityPercentage !== undefined
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
                <span className="text-xl font-semibold xl:text-2xl">
                  {networkCapacity !== undefined
                    ? networkCapacity.toLocaleString('en-US')
                    : '...'}
                </span>
                <span className="text-[10px] text-muted-foreground xl:text-xs">
                  Network Capacity
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex place-items-center gap-3">
              <div className="grid size-20 grid-cols-3 gap-0.5 max-xl:size-16">
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = Math.floor(Date.now() / 86400_000) - 29 + i
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
                  <span className="text-xl font-semibold xl:text-2xl">
                    {monthlyDeploymentCount ?? '...'}
                  </span>
                  {monthlyDeploymentGrowth > 0 && (
                    <div className="flex place-items-center gap-1 text-green-600">
                      <Triangle className="size-4 fill-green-600" />
                      <span>+{monthlyDeploymentGrowth.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground xl:text-xs">
                  30 Days Deployments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 flex w-full flex-1 basis-1/2 max-xl:basis-1/2">
        {/* <Earth className="w-full h-full earth-height" /> */}
        <video
          className="size-full object-contain"
          loop={true}
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src="/video/globe.webm" type="video/webm" />
        </video>
      </div>
    </div>
  )
}
