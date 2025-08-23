'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Earth, Rocket, Triangle } from 'lucide-react'
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
  const { data: activeDeployments } = { data: 22652 * 0.67 }
  const { data: deploymentStock } = { data: 22652 * (1 - 0.67) }
  const { data: dailyDeployments } = {
    data: Array.from({ length: 30 }).map((_) =>
      Math.round(Math.random() * 100)
    ),
  }
  const maxDailyDeploymentCount = useMemo(() => {
    return Math.max(...dailyDeployments)
  }, [dailyDeployments])

  return (
    <div className="flex size-full">
      <div className="flex flex-col gap-32">
        <div className="mt-24 px-16">
          <h1 className="text-balance pr-10 text-3xl font-semibold lg:text-7xl">
            Build and deploy AI agents in 5 minutes
          </h1>
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/app-store"
              className="flex h-14 items-center rounded-3xl bg-primary px-12 text-xl font-medium text-background transition-colors hover:bg-primary/90"
            >
              Build Now
            </Link>
            <Link
              href="https://docs.openxai.org"
              target="_blank"
              className="flex h-14 place-items-center items-center gap-2 rounded px-2 font-medium text-blue-600 transition-colors hover:bg-foreground/10"
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
                <span className="text-4xl font-medium">{'>'}50</span>
                <span>K</span>
              </div>
              <span className="text-xs">Transaction /s</span>
            </div>
          </div>
          <div className="flex place-content-center border-r border-gray-400 py-1">
            <div className="flex flex-col place-items-center">
              <div className="flex place-content-start">
                <span className="text-4xl font-medium">600</span>
                <span>ms</span>
              </div>
              <span className="text-xs">Time to Finality (avg)</span>
            </div>
          </div>
          <div className="flex place-content-center border-r border-gray-400 py-1">
            <div className="flex flex-col place-items-center">
              <div className="flex place-content-start">
                <span className="text-4xl font-medium">{'>'}50</span>
                <span>K</span>
              </div>
              <span className="text-xs">Transaction /s</span>
            </div>
          </div>
          <div className="flex place-content-center py-1">
            <div className="flex flex-col place-items-center">
              <div className="flex place-content-start">
                <span className="text-4xl font-medium">600</span>
                <span>ms</span>
              </div>
              <span className="text-xs">Time to Finality (avg)</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2">
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
                        data: Math.round(
                          (100 * activeDeployments) /
                            (activeDeployments + deploymentStock)
                        ),
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
                                  {(
                                    (100 * activeDeployments) /
                                    (activeDeployments + deploymentStock)
                                  ).toFixed(0)}
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
                  {(activeDeployments + deploymentStock).toLocaleString(
                    'en-US'
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  Network Capacity
                </span>
              </div>
            </div>
          </div>
          <div className="flex place-content-center">
            <div className="flex place-items-center gap-3">
              <div className="grid size-20 grid-cols-3 gap-0.5">
                {dailyDeployments.map((deploymentCount, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: `hsla(219, 100%, 50%, ${(0.1 + 0.9 * (deploymentCount / maxDailyDeploymentCount)).toFixed(2)})`,
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col place-content-center">
                <div className="flex place-items-center gap-4 text-2xl">
                  <span className="font-semibold">324</span>
                  <div className="flex place-items-center gap-1 text-green-600">
                    <Triangle className="size-4 fill-green-600" />
                    <span>300%</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  30 Days Deployments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full place-content-center place-items-center">
        <Earth className="size-[700px]" />
      </div>
    </div>
  )
}
