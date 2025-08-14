import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AgentDefinitions from '@/utils/agent-definitions.json'
import { prefix } from '@/utils/prefix'
import { AppWindow } from 'lucide-react'
import { remark } from 'remark'
import html from 'remark-html'
import { z } from 'zod'

import {
  getSpecsByTemplate,
  serviceByName,
  usecaseById,
  type AppStoreItem,
  type AppStorePageType,
  type ServiceData,
  type Specs,
} from '@/types/dataProvider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AgentDeployment from '@/components/AgentDeployment/agent-deployment'

import { DeploymentCounter } from './deloyment-counter'
import { DeploymentContextProvider } from './deployment-context'
import { LatestDeployments } from './latest-deployments'
import { DeploymentPanel } from './one-click/components/deployment-panel'

type DeployPageProps = {
  searchParams: {
    templateId?: string
    useCaseId?: string
    advanced?: string
    agentId?: string
  }
}

export default async function DeployPage({ searchParams }: DeployPageProps) {
  const templateId = z.string().optional().parse(searchParams.templateId)
  const useCaseId = z.string().optional().parse(searchParams.useCaseId)
  const advanced = z.string().optional().parse(searchParams.advanced)
  const agentId = z.string().optional().parse(searchParams.agentId)

  if (agentId) {
    const agent = AgentDefinitions.find((a) => a.nixName === agentId)
    if (!agent) redirect('/app-store')

    const expandedDescription = `
      A lightweight framework by Fetch.ai for building decentralized AI agents that can communicate and transact with each other. Each agent:

      • Has a unique identity from its seed phrase
      • Can communicate with other agents locally or remotely
      • Can perform scheduled tasks and respond to messages
      • Can be discovered through the Almanac network

      Multiple agents can form a network, exchanging messages in real-time and operating independently with their own personalities and behaviors. Built on Python 3.8+, the system requires minimal setup for local deployment.
    `

    return (
      <div className="container my-8">
        <div className="flex items-center gap-2 text-muted-foreground/75">
          <Link href="/app-store">App Store</Link>
          <span>/</span>
          <span className="text-primary/75">{agent.name}</span>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-8">
          {/* Left Content Panel */}
          <div className="col-span-8">
            <div className="flex flex-1 flex-col rounded border p-6">
              <div className="flex flex-1 items-start gap-3">
                {agent.logo && agent.logo !== '' ? (
                  <img
                    src={
                      agent.logo.startsWith('https://')
                        ? agent.logo
                        : `${prefix}${agent.logo}`
                    }
                    alt={`${agent.name} logo`}
                    width={48}
                    height={48}
                  />
                ) : (
                  <AppWindow
                    className="size-12 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {agent.name}
                  </h2>
                  <div className="prose prose-sm mt-4 text-muted-foreground">
                    {expandedDescription.split('\n').map((paragraph, i) => (
                      <p key={i} className="mt-2">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Configuration Panel */}
          <div className="col-span-4">
            <AgentDeployment agent={agent} />
          </div>
        </div>
      </div>
    )
  }

  function getData() {
    if (!templateId && !useCaseId && !advanced) redirect('/app-store')
    let data: AppStoreItem | undefined
    let specs: Specs | undefined
    let type: AppStorePageType | undefined
    let services: ServiceData[] | undefined

    if (useCaseId) {
      const useCase = usecaseById(useCaseId)
      if (useCase === undefined) redirect('/app-store')
      data = useCase
      specs = getSpecsByTemplate(useCase)
      services = useCase.serviceNames
        .map((service) => serviceByName(service))
        .filter((s) => s !== undefined) as ServiceData[]
      type = 'use-cases'
    }

    if (templateId) {
      const service = serviceByName(templateId)
      if (service === undefined) redirect('/app-store')
      data = { ...service, id: service.nixName }
      specs = service.specs
      services = [service]
      type = 'templates'
    }

    if (advanced) {
      const custom = JSON.parse(
        Buffer.from(advanced, 'base64url').toString('utf8')
      )
      data = custom.data
      specs = custom.specs
      services = custom.services
      type = custom.type
    }

    return { data, services, specs, type }
  }

  const { data, services, specs, type } = getData()

  if (data === undefined || type === undefined || services === undefined) {
    redirect('/app-store')
  }

  const [longDesc, useCases, support] = await Promise.all([
    data.longDesc
      ? remark()
          .use(html)
          .process(data.longDesc)
          .then((file) => file.toString())
          .then((html) => html.replaceAll('href=', 'target="blank" href='))
      : undefined,
    data.useCases
      ? remark()
          .use(html)
          .process(data.useCases)
          .then((file) => file.toString())
          .then((html) => html.replaceAll('href=', 'target="blank" href='))
      : undefined,
    data.support
      ? remark()
          .use(html)
          .process(data.support)
          .then((file) => file.toString())
          .then((html) => html.replaceAll('href=', 'target="blank" href='))
      : undefined,
  ])

  return (
    <DeploymentContextProvider
      initialData={{ name: data.name, description: data.desc, services }}
    >
      <div className="container my-8">
        <div className="flex items-center gap-2 text-muted-foreground/75">
          <Link href="/app-store">App Store</Link>
          <span>/</span>
          <span className="text-primary/75">{data.name}</span>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-8">
          {/* Left Content Panel */}
          <div className="col-span-8">
            <div className="flex flex-1 flex-col rounded border p-6">
              <div className="flex flex-1 items-start gap-3">
                {data.logo && data.logo !== '' ? (
                  <img
                    src={
                      data.logo.startsWith('https://')
                        ? data.logo
                        : `${prefix}${data.logo}`
                    }
                    alt={`${data.name} logo`}
                    width={48}
                    height={48}
                  />
                ) : (
                  <AppWindow
                    className="size-12 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                )}
                <div>
                  <div className="flex gap-2">
                    <h2 className="text-xl font-bold text-primary">
                      {data.name}
                    </h2>
                    <DeploymentCounter app={data.name} />
                  </div>
                  <p className="mt-2 line-clamp-2 max-w-prose text-muted-foreground">
                    {data.desc}
                  </p>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="mt-8">
                <Tabs defaultValue="overview">
                  <TabsList className="bg-transparent">
                    <TabsTrigger
                      value="overview"
                      className="rounded-none border-b-2 border-transparent hover:border-muted data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                      Overview
                    </TabsTrigger>
                    {data.useCases && data.useCases !== '' ? (
                      <TabsTrigger
                        value="use-cases"
                        className="rounded-none border-b-2 border-transparent hover:border-muted data-[state=active]:border-primary data-[state=active]:shadow-none"
                      >
                        Use Cases
                      </TabsTrigger>
                    ) : null}
                    {data.support && data.support !== '' ? (
                      <TabsTrigger
                        value="support"
                        className="rounded-none border-b-2 border-transparent hover:border-muted data-[state=active]:border-primary data-[state=active]:shadow-none"
                      >
                        Support
                      </TabsTrigger>
                    ) : null}
                  </TabsList>
                  <TabsContent
                    value="overview"
                    className="w-full text-muted-foreground"
                  >
                    <div className="flex flex-col gap-4">
                      {data.longDesc && data.longDesc !== '' ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: longDesc || '' }}
                        />
                      ) : (
                        data.desc
                      )}
                      <LatestDeployments app={data.name} />
                    </div>
                  </TabsContent>
                  {data.useCases && data.useCases !== '' ? (
                    <TabsContent
                      value="use-cases"
                      className="prose prose-sm text-muted-foreground"
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: useCases || '' }}
                      />
                    </TabsContent>
                  ) : null}
                  {data.support && data.support !== '' ? (
                    <TabsContent
                      value="support"
                      className="prose prose-sm text-muted-foreground"
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: support || '' }}
                      />
                    </TabsContent>
                  ) : null}
                </Tabs>
              </div>
            </div>
          </div>

          {/* Right Deployment Panel */}
          <div className="col-span-4">
            <Suspense fallback={<div>Loading...</div>}>
              {templateId === 'fetch-ai-uagents' ? (
                <AgentDeployment agent={AgentDefinitions[0]} />
              ) : (
                <DeploymentPanel templateId={templateId} app={data.name} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </DeploymentContextProvider>
  )
}
